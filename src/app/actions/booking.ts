'use server';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { redirect } from 'next/navigation';
import { squareService } from '@/services/squareService';
import { randomUUID } from 'crypto';
import webpush from 'web-push';

// Configure Web Push (Move to global config if used elsewhere)
try {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            'mailto:admin@mobilegaragedoor.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }
} catch (err) {
    console.error('Error configuring Web Push in booking:', err);
}

interface CustomerData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
}

// 1. Private Helper: Find or Create Customer
async function findOrCreateCustomer(payload: any, data: CustomerData): Promise<number> {
  const existingCustomers = await payload.find({
    collection: 'users',
    where: {
      email: { equals: data.guestEmail },
    },
  });

  if (existingCustomers.totalDocs > 0) {
    return existingCustomers.docs[0].id as number;
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

  return newCustomer.id as number;
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

  let customerId: number | undefined;

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
    const tripFee = 9900; // 99.00
    const payment = await squareService.processPayment(
      sourceId,
      tripFee,
      `Trip Fee for ${guestName} (${guestEmail})`
    );

    // C. Service Request Logic
    const newServiceRequest = await payload.create({
      collection: 'service-requests',
      data: {
        customer: customerId as number, // Cast to number or correct ID type
        issueDescription: issueDescription,
        urgency: urgency as 'standard' | 'emergency',
        scheduledTime: scheduledTime,
        status: 'pending',
        tripFeePayment: {
            paymentId: payment.id,
            amount: Number(payment.amountMoney?.amount),
            status: payment.status,
        },
      },
    });

    // Notify Admins & Dispatchers
    try {
        const admins = await payload.find({
            collection: 'users',
            where: {
                or: [
                    { role: { equals: 'admin' } },
                    { role: { equals: 'dispatcher' } }
                ]
            }
        });

        const notifications = admins.docs
            .filter((user: any) => user.pushSubscription)
            .map((user: any) => 
                webpush.sendNotification(
                    user.pushSubscription,
                    JSON.stringify({
                        title: 'New Service Request!',
                        body: `${guestName}: ${issueDescription}`,
                        url: '/admin/mission-control'
                    })
                ).catch(err => console.error(`Failed to notify admin ${user.email}:`, err))
            );
        
        await Promise.all(notifications);
    } catch (notifyError) {
        console.error('Error sending admin notifications:', notifyError);
    }

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
