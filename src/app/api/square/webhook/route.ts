import { NextRequest, NextResponse } from 'next/server';
import { SquareClient as Client, SquareEnvironment as Environment, WebhooksHelper } from 'square';
import { getDB } from "@/db";
import { users, payments, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from 'crypto';
import { getCloudflareContext } from "@/lib/cloudflare";

// SquareClient is dynamically instantiated inside functions that need it using getCloudflareContext().env

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-square-hmac-sha256');

  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    if (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY && signature) {
      const isValid = (WebhooksHelper as any).isValidWebhookEventSignature(
        body,
        signature,
        process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
        process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || 'http://localhost:3000/api/square/webhook'
      );

      if (!isValid) {
        console.error('Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const event = JSON.parse(body);
    console.log(`Received Square Webhook: ${event.type}`, event.data.id);

    switch (event.type) {
      case 'payment.created':
      case 'payment.updated': {
        const payment = event.data.object.payment;
        const squarePaymentId = payment.id;
        const status = payment.status;
        const amount = Number(payment.amount_money.amount);
        const currency = payment.amount_money.currency;
        const sourceType = payment.source_type;
        const customerId = payment.customer_id;
        const note = payment.note || '';

        let userId = null;
        if (customerId) {
          try {
            const squareClient = new Client({
              token: env.SQUARE_ACCESS_TOKEN,
              environment: env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
            });

            const squareResp = await squareClient.customers.get({ customerId });
            const customer = squareResp.customer;

            if (customer && customer.emailAddress) {
              const existingUser = await db.select().from(users).where(eq(users.email, customer.emailAddress)).limit(1);

              if (existingUser.length > 0) {
                userId = existingUser[0].id;
                if (!existingUser[0].squareCustomerId) {
                  await db.update(users).set({ squareCustomerId: customerId }).where(eq(users.id, userId));
                }
              } else {
                userId = randomUUID();
                await db.insert(users).values({
                  id: userId,
                  email: customer.emailAddress,
                  name: `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || 'Square Customer',
                  phone: customer.phoneNumber || '',
                  role: 'customer',
                  squareCustomerId: customerId,
                  emailVerified: false,
                });
              }
            }
          } catch (err) {
            console.error('Error fetching/syncing customer:', err);
          }
        }

        const existingPayments = await db.select().from(payments).where(eq(payments.squarePaymentId, squarePaymentId)).limit(1);

        if (existingPayments.length > 0) {
          await db.update(payments).set({
            status,
            amount,
            currency,
            sourceType,
            note: note || existingPayments[0].note,
            updatedAt: new Date().toISOString(),
          }).where(eq(payments.id, existingPayments[0].id));
        } else {
          await db.insert(payments).values({
            squarePaymentId,
            amount,
            currency,
            status,
            sourceType,
            note,
          });
        }
        break;
      }

      case 'invoice.payment_made': {
        const invoiceObj = event.data.object.invoice;
        const squareInvoiceId = invoiceObj.id;
        const status = invoiceObj.status;
        const amount = Number(invoiceObj.payment_requests[0].computed_amount_money.amount);

        const existingInvoices = await db.select().from(invoices).where(eq(invoices.squareInvoiceId, squareInvoiceId)).limit(1);

        if (existingInvoices.length > 0) {
          await db.update(invoices).set({
            status,
            amount,
            updatedAt: new Date().toISOString(),
          }).where(eq(invoices.id, existingInvoices[0].id));
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
