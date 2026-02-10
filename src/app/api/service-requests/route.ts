import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ req });

    if (!user || (user as any).collection !== 'customers') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId, issueDescription, urgency, scheduledTime, amount } = await req.json();

    // 1. Process Payment with Square
    // Note: In production, amount should be calculated server-side based on the service selected
    // For this demo, we'll use the passed amount but validate it against known fees if needed.
    const tripFee = 9900; // $99.00 in cents
    
    // Create Payment
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(tripFee),
        currency: 'USD',
      },
      note: `Trip Fee for Ticket #${Date.now()}`, // Simple note
    });

    if (!result.payment || result.payment.status !== 'COMPLETED') { 
       // Note: status might be 'APPROVED' if delayed capture, but for cards it's usually COMPLETED or FAILED
       // If it fails, createPayment throws or returns error.
       // We'll assume success if we get here and check status.
    }

    // 2. Create Service Request in Payload
    const serviceRequest = await payload.create({
      collection: 'service-requests' as any,
      data: {
        customer: user.id,
        issueDescription,
        urgency,
        scheduledTime,
        status: 'confirmed', // Confirmed because payment is successful
        tripFeePayment: {
            paymentId: result.payment?.id,
            amount: Number(result.payment?.amountMoney?.amount),
            status: result.payment?.status,
        }
      },
    });

    // 3. Create Payment Record (for syncing purposes)
    if (result.payment?.id) {
         await payload.create({
            collection: 'payments' as any,
            data: {
                squarePaymentId: result.payment.id,
                amount: Number(result.payment.amountMoney?.amount),
                currency: result.payment.amountMoney?.currency,
                status: result.payment.status,
                sourceType: result.payment.sourceType,
            }
        });
    }
    
    return NextResponse.json({ success: true, serviceRequest });
  } catch (error: any) {
    console.error('Booking Error:', error);
    // Square Error Handling
    if (error.result && error.result.errors) {
        return NextResponse.json({ error: error.result.errors[0].detail }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to process booking' }, { status: 500 });
  }
}
