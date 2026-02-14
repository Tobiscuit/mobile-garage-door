import { NextRequest, NextResponse } from 'next/server';
import { SquareClient as Client, SquareEnvironment as Environment, WebhooksHelper } from 'square';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { randomUUID } from 'crypto';

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
    // In dev, we might want to skip signature verification for testing if key is missing
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Missing signature or key' }, { status: 400 });
    }
  }

  try {
    // Verify Signature
    // Only verify if we have the key
    if (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
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
    const payload = await getPayload({ config: configPromise });

    console.log(`Received Square Webhook: ${event.type}`, event.data.id);

    switch (event.type) {
      case 'payment.created':
      case 'payment.updated': {
        const payment = event.data.object.payment;
        const squarePaymentId = payment.id;
        const status = payment.status; // COMPLETED, FAILED, etc.
        const amount = Number(payment.amount_money.amount);
        const currency = payment.amount_money.currency;
        const sourceType = payment.source_type;
        const customerId = payment.customer_id;
        const note = payment.note || '';

        // 1. Sync Customer if present
        let userId = null;
        if (customerId) {
            try {
                // Check local
                const existingUsers = await payload.find({
                    collection: 'users',
                    where: {
                        // We might need a squareCustomerId field in users collection
                        // For now, we try to match by email if we can fetch the customer from Square
                    }
                });
                
                // Fetch customer details from Square to get email
                try {
                    const response = await squareClient.customers.get({ customerId });
                    const customer = response.customer;
                    
                    if (customer && customer.emailAddress) {
                        const existingUser = await payload.find({
                            collection: 'users',
                            where: {
                                email: { equals: customer.emailAddress }
                            }
                        });

                        if (existingUser.totalDocs > 0) {
                            userId = existingUser.docs[0].id;
                            // Update squareCustomerId if missing
                            if (!existingUser.docs[0].squareCustomerId) {
                                await payload.update({
                                    collection: 'users',
                                    id: userId,
                                    data: { squareCustomerId: customerId }
                                });
                            }
                        } else {
                            // Create new user
                            const newUser = await payload.create({
                                collection: 'users',
                                data: {
                                    email: customer.emailAddress,
                                    name: `${customer.givenName || ''} ${customer.familyName || ''}`.trim() || 'Square Customer',
                                    phone: customer.phoneNumber || '',
                                    password: randomUUID(), // Random password
                                    role: 'customer',
                                    squareCustomerId: customerId,
                                    // address: ... // Parse address if needed
                                }
                            });
                            userId = newUser.id;
                        }
                    }
                } catch (err) {
                    console.error('Error fetching/syncing customer:', err);
                }

            } catch (err) {
                console.error('Error finding user:', err);
            }
        }

        // 2. Sync Payment
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
              note: note || existingPayments.docs[0].note, // Keep existing note if new one is empty
              // user: userId // Link to user if we found one (Need to add user field to payments schema first)
            },
          });
          console.log(`Updated payment ${squarePaymentId}`);
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
              note,
            },
          });
          console.log(`Created payment ${squarePaymentId}`);
        }
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
             console.log(`Updated invoice ${squareInvoiceId}`);
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
