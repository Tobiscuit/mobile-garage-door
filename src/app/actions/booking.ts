'use server';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { redirect } from 'next/navigation';
import { squareService } from '@/services/squareService';
import { randomUUID } from 'crypto';

interface CustomerData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
}

// 1. Private Helper: Find or Create Customer
async function findOrCreateCustomer(payload: any, data: CustomerData): Promise<string | number> {
  const existingCustomers = await payload.find({
    collection: 'users',
    where: {
      email: { equals: data.guestEmail },
    },
  });

  if (existingCustomers.totalDocs > 0) {
    return existingCustomers.docs[0].id;
  }

  const passwordToUse = data.guestPassword || randomUUID();
  const newCustomer = await payload.create({
    collection: 'users',
    data: {
      email: data.guestEmail,
      password: passwordToUse,
      name: data.guestName,
      phone: data.guestPhone,
      address: data.guestAddress,
      role: 'customer',
    },
  });

  return newCustomer.id;
}

// 2. Main Server Action
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
    // A. Customer Logic
    customerId = await findOrCreateCustomer(payload, {
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
      guestPassword
    });

    // B. Payment Logic (Service Layer)
    const tripFee = 9900; // 9.00
    const payment = await squareService.processPayment(
      sourceId,
      tripFee,
      `Trip Fee for ${guestName} (${guestEmail})`
    );

    // C. Service Request Logic
    await payload.create({
      collection: 'service-requests',
      data: {
        customer: customerId as number, // Cast to number or correct ID type
        issueDescription,
        urgency: urgency as 'standard' | 'emergency',
        scheduledTime,
        status: 'confirmed',
        tripFeePayment: {
            paymentId: payment.id,
            amount: Number(payment.amountMoney?.amount),
            status: payment.status,
        },
      },
    });

    // D. Payment Logging Logic
    if (payment.id) {
        await payload.create({
           collection: 'payments',
           data: {
               squarePaymentId: payment.id,
               amount: Number(payment.amountMoney?.amount),
               currency: payment.amountMoney?.currency,
               status: payment.status,
               sourceType: payment.sourceType,
           }
       });
   }

  } catch (error: any) {
    console.error('Booking Error:', error);
    let errorMessage = 'Failed to process booking.';
    
    // Check if it's a known error object
    if (error.message) {
      errorMessage = error.message;
    }

    return { error: errorMessage };
  }

  // Success Redirect
  redirect('/portal?success=booked');
}
