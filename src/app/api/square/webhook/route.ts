import { NextRequest, NextResponse } from 'next/server';
import { SquareClient as Client, SquareEnvironment as Environment, WebhooksHelper } from 'square';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// Initialize Square Client
const squareClient = new Client({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-square-hmac-sha256');

  if (!signature || !process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    console.error('Missing signature or signature key');
    return NextResponse.json({ error: 'Missing signature or key' }, { status: 400 });
  }

  try {
    // Verify Signature
    const isValid = (WebhooksHelper as any).isValidWebhookEventSignature(
      body,
      signature,
      process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || 'http://localhost:3000/api/square/webhook' 
      // Note: SQUARE_WEBHOOK_NOTIFICATION_URL must match exactly what is registered in Square Dashboard
    );

    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const event = JSON.parse(body);
    const payload = await getPayload({ config: configPromise });

    switch (event.type) {
      case 'payment.updated': {
        const payment = event.data.object.payment;
        const squarePaymentId = payment.id;
        const status = payment.status; // COMPLETED, FAILED, etc.
        const amount = Number(payment.amount_money.amount);
        const currency = payment.amount_money.currency;
        const sourceType = payment.source_type;

        // Sync to 'payments' collection
        // Check if exists
        const existingPayments = await payload.find({
          collection: 'payments' as any,
          where: {
            squarePaymentId: { equals: squarePaymentId },
          },
        });

        if (existingPayments.totalDocs > 0) {
          // Update
          await payload.update({
            collection: 'payments' as any,
            id: existingPayments.docs[0].id,
            data: {
              status,
              amount,
              currency,
              sourceType,
            },
          });
        } else {
          // Create
          await payload.create({
            collection: 'payments' as any,
            data: {
              squarePaymentId,
              amount,
              currency,
              status,
              sourceType,
            },
          });
        }
        
        // Also update ServiceRequest if linked (Not implemented yet, but placeholder logic)
        // If payment has reference_id pointing to ticket, we could use that.
        break;
      }

      case 'invoice.payment_made': {
        const invoice = event.data.object.invoice;
        const squareInvoiceId = invoice.id;
        const status = invoice.status; // PAID
        const amount = Number(invoice.payment_requests[0].computed_amount_money.amount);

        const existingInvoices = await payload.find({
            collection: 'invoices' as any,
            where: {
                squareInvoiceId: { equals: squareInvoiceId }
            }
        });

        if (existingInvoices.totalDocs > 0) {
            await payload.update({
                collection: 'invoices' as any,
                id: existingInvoices.docs[0].id,
                data: {
                    status,
                    amount,
                }
            });
        }
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
