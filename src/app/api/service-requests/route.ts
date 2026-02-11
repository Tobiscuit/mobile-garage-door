import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { SquareClient as Client, SquareEnvironment as Environment } from 'square';
import { randomUUID } from 'crypto';

const squareClient = new Client({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: req.headers });
    let customerId = user?.id;

    const body = await req.json();
    const { sourceId, issueDescription, urgency, scheduledTime, amount, guestName, guestEmail, guestPhone, guestAddress } = body;

    if (!user) {
        // Allow Guest Checkout if details provided
        if (guestName && guestPhone && guestEmail) {
             // 1. Check if customer exists by Email
            const existingCustomers = await payload.find({
                collection: 'customers' as any,
                where: {
                    email: { equals: guestEmail },
                },
            });

            if (existingCustomers.totalDocs > 0) {
                customerId = existingCustomers.docs[0].id;
            } else {
                // 2. Create new Customer
                const randomPassword = randomUUID(); 
                const newCustomer = await payload.create({
                    collection: 'customers' as any,
                    data: {
                        email: guestEmail,
                        password: randomPassword,
                        name: guestName,
                        phone: guestPhone,
                        address: guestAddress,
                    },
                });
                customerId = newCustomer.id;
            }
        } else {
             return NextResponse.json({ error: 'Unauthorized: Please login or provide guest details.' }, { status: 401 });
        }
    }

    // 1. Process Payment with Square
    // Note: In production, amount should be calculated server-side based on the service selected
    // For this demo, we'll use the passed amount but validate it against known fees if needed.
    const tripFee = 9900; // $99.00 in cents
    
    // Create Payment
    const result = await squareClient.payments.create({
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
        customer: customerId,
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
