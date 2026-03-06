import { NextRequest, NextResponse } from 'next/server';
import { getDB } from "@/db";
import { users, serviceRequests, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SquareClient as Client, SquareEnvironment as Environment } from 'square';
import { randomUUID } from 'crypto';
import { getCloudflareContext } from "@/lib/cloudflare";

// SquareClient is dynamically instantiated inside functions that need it using getCloudflareContext().env

export async function POST(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const { getSessionSafe } = await import('@/lib/get-session-safe');
    const session = await getSessionSafe(req.headers);

    let user = null;
    let customerId;
    if (session) {
      user = session.user;
      customerId = user.id;
    }

    const apiKey = req.headers.get('x-api-key');
    const isValidApiKey = apiKey && process.env.SERVICE_API_KEY && apiKey === process.env.SERVICE_API_KEY;

    const body = await req.json();
    const { sourceId, issueDescription, urgency, scheduledTime, guestName, guestEmail, guestPhone, guestAddress } = body;

    if (!user && !isValidApiKey) {
      if (guestName && guestPhone && guestEmail) {
        const existing = await db.select().from(users).where(eq(users.email, guestEmail)).limit(1);

        if (existing.length > 0) {
          customerId = existing[0].id;
        } else {
          customerId = randomUUID();
          await db.insert(users).values({
            id: customerId,
            email: guestEmail,
            name: guestName,
            phone: guestPhone,
            address: guestAddress,
            role: 'customer',
          });
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized: Please login or provide guest details.' }, { status: 401 });
      }
    }

    const tripFee = 9900;

    const result = await squareClient.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(tripFee),
        currency: 'USD',
      },
      note: `Trip Fee for Ticket #${Date.now()}`,
    });

    const paymentResult = JSON.parse(JSON.stringify(result.payment, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    const ticketId = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTickets = await db.insert(serviceRequests).values({
      ticketId,
      customerId,
      issueDescription,
      urgency,
      scheduledTime,
      status: 'confirmed',
      tripFeePayment: JSON.stringify({
        paymentId: paymentResult.id,
        amount: Number(paymentResult.amountMoney?.amount),
        status: paymentResult.status,
      })
    }).returning();

    if (paymentResult.id) {
      await db.insert(payments).values({
        squarePaymentId: paymentResult.id,
        amount: Number(paymentResult.amountMoney?.amount),
        currency: paymentResult.amountMoney?.currency,
        status: paymentResult.status,
        sourceType: paymentResult.sourceType,
      });
    }

    return NextResponse.json({ success: true, serviceRequest: newTickets[0] });
  } catch (error: any) {
    console.error('Booking Error:', error);
    if (error.result && error.result.errors) {
      return NextResponse.json({ error: error.result.errors[0].detail }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to process booking' }, { status: 500 });
  }
}
