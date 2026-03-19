'use server';

import { getDB } from '@/db';
import { serviceRequests, users, invoices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { SquareClient, SquareEnvironment } from 'square';
import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from '@/lib/cloudflare';
import { randomUUID } from 'crypto';
import { sendPushToUser } from '@/lib/push';

function getSquareClient(env: any) {
  return new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment: env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
  });
}

/**
 * Set the quoted price for a service request.
 */
export async function setQuotedPrice(serviceRequestId: number, priceInCents: number) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;

    await db.update(serviceRequests)
      .set({ quotedPrice: priceInCents, updatedAt: new Date().toISOString() })
      .where(eq(serviceRequests.id, serviceRequestId));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Set Quoted Price Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create and publish a Square Invoice for a service request.
 * Square handles emailing the customer the branded invoice with pay link.
 */
export async function sendSquareInvoice(
  serviceRequestId: number,
  amountInCents: number,
  note: string
) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB)!;
    const squareClient = getSquareClient(env);

    // Get the service request and customer info
    const [sr] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, serviceRequestId))
      .limit(1);

    if (!sr) throw new Error('Service request not found');
    if (!sr.customerId) throw new Error('No customer linked to this service request');

    const [customer] = await db.select()
      .from(users)
      .where(eq(users.id, sr.customerId))
      .limit(1);

    if (!customer) throw new Error('Customer not found');
    if (!customer.email) throw new Error('Customer has no email address');

    // Ensure Square Customer exists
    let squareCustomerId = customer.squareCustomerId;
    if (!squareCustomerId) {
      const nameParts = (customer.name || 'Customer').split(' ');
      const createResult = await squareClient.customers.create({
        idempotencyKey: randomUUID(),
        emailAddress: customer.email,
        givenName: nameParts[0],
        familyName: nameParts.slice(1).join(' ') || undefined,
        phoneNumber: customer.phone || undefined,
      });
      squareCustomerId = createResult.customer?.id || null;
      if (squareCustomerId) {
        await db.update(users)
          .set({ squareCustomerId })
          .where(eq(users.id, customer.id));
      }
    }

    if (!squareCustomerId) throw new Error('Failed to create Square Customer');

    const locationId = env.SQUARE_LOCATION_ID || env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!locationId) throw new Error('SQUARE_LOCATION_ID not configured');

    // 1. Create an Order (required by Square Invoices)
    const orderResult = await squareClient.orders.create({
      order: {
        locationId,
        customerId: squareCustomerId,
        lineItems: [{
          name: note || `Garage Door Repair — ${sr.ticketId}`,
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(amountInCents),
            currency: 'USD',
          },
        }],
      },
      idempotencyKey: randomUUID(),
    });

    const orderId = orderResult.order?.id;
    if (!orderId) throw new Error('Failed to create Square Order');

    // 2. Create the Invoice
    const invoiceResult = await squareClient.invoices.create({
      invoice: {
        locationId,
        orderId,
        primaryRecipient: {
          customerId: squareCustomerId,
        },
        paymentRequests: [{
          requestType: 'BALANCE',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Due in 7 days
          automaticPaymentSource: 'NONE',
        }],
        deliveryMethod: 'EMAIL',
        title: `Mobil Garage Door — ${sr.ticketId}`,
        description: note || 'Garage door repair service',
        acceptedPaymentMethods: {
          card: true,
          squareGiftCard: false,
          bankAccount: false,
          buyNowPayLater: false,
          cashAppPay: true,
        },
      },
      idempotencyKey: randomUUID(),
    });

    const invoice = invoiceResult.invoice;
    if (!invoice?.id) throw new Error('Failed to create Invoice');

    // 3. Publish the invoice (this sends the email)
    const publishResult = await squareClient.invoices.publish(invoice.id, {
      version: invoice.version ?? 0,
      idempotencyKey: randomUUID(),
    } as any);

    const publishedInvoice = publishResult.invoice;

    // 4. Save to our DB
    await db.insert(invoices).values({
      squareInvoiceId: invoice.id,
      orderId,
      amount: amountInCents,
      status: publishedInvoice?.status || 'SENT',
      customerId: sr.customerId,
      publicUrl: publishedInvoice?.publicUrl || null,
    });

    // Update service request with the quoted price
    await db.update(serviceRequests)
      .set({ quotedPrice: amountInCents, updatedAt: new Date().toISOString() })
      .where(eq(serviceRequests.id, serviceRequestId));

    // Notify the customer that their invoice is ready
    if (sr.customerId) {
      try {
        await sendPushToUser(
          sr.customerId,
          {
            title: '📄 Invoice Ready',
            body: `Your invoice for $${(amountInCents / 100).toFixed(2)} is ready. Check your email for the payment link.`,
            tag: 'invoice-ready',
            data: { url: `/portal/track/${sr.ticketId}`, ticketId: sr.ticketId },
          },
          env as any
        );
      } catch (pushError) {
        console.error('Failed to send invoice push:', pushError);
      }
    }

    revalidatePath('/dashboard');
    return {
      success: true,
      invoiceId: invoice.id,
      publicUrl: publishedInvoice?.publicUrl,
    };
  } catch (error: any) {
    console.error('Send Invoice Error:', error);
    return { success: false, error: error.message || 'Failed to send invoice' };
  }
}
