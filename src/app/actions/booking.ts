'use server';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { SquareClient as Client, SquareEnvironment as Environment } from 'square';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';

const squareClient = new Client({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function createBooking(prevState: any, formData: FormData) {
  const payload = await getPayload({ config: configPromise });

  const guestName = formData.get('guestName') as string;
  const guestEmail = formData.get('guestEmail') as string;
  const guestPhone = formData.get('guestPhone') as string;
  const guestAddress = formData.get('guestAddress') as string;
  const guestPassword = formData.get('guestPassword') as string;
  const issueDescription = formData.get('issueDescription') as string;
  const urgency = formData.get('urgency') as string;
  const scheduledTime = formData.get('scheduledTime') as string;
  const sourceId = formData.get('sourceId') as string; // Square Token

  let customerId: string | number | undefined;

  try {
    // 1. Check for existing user
    const existingCustomers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: guestEmail },
      },
    });

    if (existingCustomers.totalDocs > 0) {
      customerId = existingCustomers.docs[0].id;
      // Optionally update phone/address if missing?
    } else {
      // 2. Create new Customer
      // If no password provided, generate one (Guest Checkout style)
      // But if provided, they are setting up an account.
      const passwordToUse = guestPassword || randomUUID();
      
      const newCustomer = await payload.create({
        collection: 'users',
        data: {
          email: guestEmail,
          password: passwordToUse,
          name: guestName,
          phone: guestPhone,
          address: guestAddress,
          role: 'customer',
        },
      });
      customerId = newCustomer.id;
    }

    // 3. Process Payment
    const tripFee = 9900; // $99.00
    const paymentResult = await squareClient.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(tripFee),
        currency: 'USD',
      },
      note: `Trip Fee for ${guestName} (${guestEmail})`,
    });

    if (!paymentResult.payment || (paymentResult.payment.status !== 'COMPLETED' && paymentResult.payment.status !== 'APPROVED')) {
      return { error: 'Payment failed. Please try a different card.' };
    }

    // 4. Create Service Request
    await payload.create({
      collection: 'service-requests',
      data: {
        customer: customerId,
        issueDescription,
        urgency: urgency as 'standard' | 'emergency',
        scheduledTime,
        status: 'confirmed',
        tripFeePayment: {
            paymentId: paymentResult.payment.id,
            amount: Number(paymentResult.payment.amountMoney?.amount),
            status: paymentResult.payment.status,
        },
      },
    });

    // 5. Log Payment
    if (paymentResult.payment?.id) {
        await payload.create({
           collection: 'payments',
           data: {
               squarePaymentId: paymentResult.payment.id,
               amount: Number(paymentResult.payment.amountMoney?.amount),
               currency: paymentResult.payment.amountMoney?.currency,
               status: paymentResult.payment.status,
               sourceType: paymentResult.payment.sourceType,
           }
       });
   }

  } catch (error: any) {
    console.error('Booking Error:', error);
    let errorMessage = 'Failed to process booking.';
    
    // Square specific errors
    if (error.result && error.result.errors) {
        errorMessage = error.result.errors[0].detail;
    } else if (error.message) {
        errorMessage = error.message;
    }

    return { error: errorMessage };
  }

  // Success Redirect
  redirect('/portal?success=booked');
}
