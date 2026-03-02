'use server';

import { getDB } from "@/db";
import { users, serviceRequests, payments } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from 'vinext/navigation';
import { squareService } from '@/services/squareService';
import { randomUUID } from 'crypto';
import webpush from 'web-push';
import { getCloudflareContext } from "vinext/cloudflare";

// Configure Web Push
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
}

async function findOrCreateCustomer(db: any, data: CustomerData): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.email, data.guestEmail)).limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const id = randomUUID();
  const newCustomer = await db.insert(users).values({
    id,
    email: data.guestEmail,
    name: data.guestName,
    phone: data.guestPhone,
    address: data.guestAddress,
    role: 'customer',
  }).returning();

  return newCustomer[0].id;
}

export async function createBooking(prevState: any, formData: FormData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);

  const guestName = formData.get('guestName') as string;
  const guestEmail = formData.get('guestEmail') as string;
  const guestPhone = formData.get('guestPhone') as string;
  const guestAddress = formData.get('guestAddress') as string;
  const issueDescription = formData.get('issueDescription') as string;
  const urgency = formData.get('urgency') as string;
  const scheduledTime = formData.get('scheduledTime') as string;
  const sourceId = formData.get('sourceId') as string;

  let customerId: string;

  try {
    customerId = await findOrCreateCustomer(db, {
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
    });

    const tripFee = 9900;
    const paymentResult = await squareService.processPayment(
      sourceId,
      tripFee,
      `Trip Fee for ${guestName} (${guestEmail})`
    );

    const ticketId = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.insert(serviceRequests).values({
      ticketId,
      customerId,
      issueDescription,
      urgency: urgency as 'standard' | 'emergency',
      scheduledTime,
      status: 'pending',
      tripFeePayment: JSON.stringify({
        paymentId: paymentResult.id,
        amount: Number(paymentResult.amountMoney?.amount),
        status: paymentResult.status,
      }),
    });

    // Notify Admins
    try {
        const admins = await db.select().from(users).where(
            or(
                eq(users.role, 'admin'),
                eq(users.role, 'dispatcher')
            )
        );

        const notifications = admins
            .filter((user: any) => user.pushSubscription)
            .map((user: any) => {
                try {
                    const sub = JSON.parse(user.pushSubscription);
                    return webpush.sendNotification(
                        sub,
                        JSON.stringify({
                            title: 'New Service Request!',
                            body: `${guestName}: ${issueDescription}`,
                            url: '/admin/mission-control'
                        })
                    );
                } catch (e) {
                    return Promise.resolve();
                }
            });
        
        await Promise.all(notifications);
    } catch (notifyError) {
        console.error('Error sending admin notifications:', notifyError);
    }

    if (paymentResult.id) {
        await db.insert(payments).values({
            squarePaymentId: paymentResult.id,
            amount: Number(paymentResult.amountMoney?.amount),
            currency: paymentResult.amountMoney?.currency,
            status: paymentResult.status,
            sourceType: paymentResult.sourceType,
        });
    }

  } catch (error: any) {
    console.error('Booking Error:', error);
    return { error: error.message || 'Failed to process booking.' };
  }

  redirect('/portal?success=booked');
}
