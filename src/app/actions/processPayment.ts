'use server';

import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { getDB } from "@/db";
import { users, serviceRequests, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@/lib/cloudflare";
import { geocodeAddress } from "@/lib/geocode";

// SquareClient is dynamically instantiated inside functions that need it using getCloudflareContext().env

interface PaymentData {
  sourceId: string;
  amount?: number;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    issue: string;
    urgency: 'Standard' | 'Emergency';
    scheduledTime?: string;
  }
}

export async function processPayment({ sourceId, amount = 9900, customerDetails }: PaymentData) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const isProduction = env.SQUARE_ENVIRONMENT === 'production';
    const squareClient = new SquareClient({
      token: env.SQUARE_ACCESS_TOKEN,
      environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    let squareCustomerId: string | undefined;

    try {
      const searchReq = await squareClient.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: customerDetails.email
            }
          }
        }
      });

      if (searchReq.customers?.length) {
        squareCustomerId = searchReq.customers[0].id;
      } else {
        const createReq = await squareClient.customers.create({
          givenName: customerDetails.name.split(' ')[0],
          familyName: customerDetails.name.split(' ').slice(1).join(' ') || '',
          emailAddress: customerDetails.email,
          phoneNumber: customerDetails.phone,
          address: {
            addressLine1: customerDetails.address,
          },
          referenceId: customerDetails.email,
          note: 'Created via Dispatch App'
        });
        squareCustomerId = createReq.customer?.id;
      }
    } catch (e) {
      console.warn('Failed to sync Square Customer profile:', e);
    }

    const idempotencyKey = randomUUID();
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      customerId: squareCustomerId,
      autocomplete: true,
      note: `Dispatch Fee - ${customerDetails.name}`,
    });

    const paymentResult = JSON.parse(JSON.stringify(response.payment, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    await db.insert(payments).values({
      squarePaymentId: paymentResult.id,
      amount: Number(paymentResult.amountMoney.amount),
      currency: paymentResult.amountMoney.currency,
      status: paymentResult.status,
      sourceType: paymentResult.sourceType || 'CARD',
      note: `Dispatch Fee - ${customerDetails.name} (via App)`,
    });

    const existingUsers = await db.select().from(users).where(eq(users.email, customerDetails.email)).limit(1);

    let payloadUserId: string;

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      payloadUserId = existing.id;

      if (!existing.squareCustomerId && squareCustomerId) {
        await db.update(users).set({ squareCustomerId }).where(eq(users.id, existing.id));
      }
      // Update phone if missing
      if (!existing.phone && customerDetails.phone) {
        await db.update(users).set({ phone: customerDetails.phone }).where(eq(users.id, existing.id));
      }
    } else {
      payloadUserId = randomUUID();
      await db.insert(users).values({
        id: payloadUserId,
        email: customerDetails.email,
        name: customerDetails.name,
        phone: customerDetails.phone,
        address: customerDetails.address,
        role: 'customer',
        squareCustomerId: squareCustomerId,
        emailVerified: false,
      });
    }

    // Geocode the customer address for tracking ETA
    const coords = await geocodeAddress(customerDetails.address);

    const ticketId = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTickets = await db.insert(serviceRequests).values({
      ticketId,
      customerId: payloadUserId,
      issueDescription: customerDetails.issue,
      urgency: customerDetails.urgency === 'Emergency' ? 'emergency' : 'standard',
      scheduledTime: customerDetails.scheduledTime || null,
      status: 'pending',
      tripFeePayment: JSON.stringify(paymentResult),
      customerLat: coords?.lat ?? null,
      customerLng: coords?.lng ?? null,
    }).returning();

    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/dashboard');
    } catch (e) { }

    return { success: true, payment: paymentResult, ticket: newTickets[0] };

  } catch (error: any) {
    console.error('Payment/Booking Error:', error);
    return {
      success: false,
      error: error.result?.errors?.[0]?.detail || error.message || 'Payment failed'
    };
  }
}
