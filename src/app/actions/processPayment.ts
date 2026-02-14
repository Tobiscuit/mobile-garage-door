'use server';

import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Initialize Square Client
// Use SQUARE_ENVIRONMENT env var to control environment, default to Sandbox
const isProduction = process.env.SQUARE_ENVIRONMENT === 'production';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

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
    }
}

export async function processPayment({ sourceId, amount = 9900, customerDetails }: PaymentData) {
  try {
    // Debug logging to help troubleshoot auth issues
    console.log(`[ProcessPayment] Env: ${isProduction ? 'Production' : 'Sandbox'}`);
    console.log(`[ProcessPayment] Token: ${process.env.SQUARE_ACCESS_TOKEN ? 'Set (***)' : 'Missing'}`);
    
        // 1. Manage Square Customer (Architecture: Sync Square Customer -> Payload)
    let squareCustomerId: string | undefined;

    try {
      // A. Search for existing customer in Square
      const searchReq = await squareClient.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: customerDetails.email
            }
          }
        }
      });

      if (searchReq.result.customers?.length) {
        squareCustomerId = searchReq.result.customers[0].id;
      } else {
        // B. Create new customer in Square if not found
        const createReq = await squareClient.customers.create({
          givenName: customerDetails.name.split(' ')[0],
          familyName: customerDetails.name.split(' ').slice(1).join(' ') || '',
          emailAddress: customerDetails.email,
          phoneNumber: customerDetails.phone,
          address: {
            addressLine1: customerDetails.address,
          },
          referenceId: customerDetails.email, // Link back to our system logic
          note: 'Created via Dispatch App'
        });
        squareCustomerId = createReq.result.customer?.id;
      }
    } catch (e) {
      console.warn('Failed to sync Square Customer profile, proceeding with guest checkout:', e);
      // We don't block payment if customer creation fails
    }

    // 2. Process Payment
    const idempotencyKey = randomUUID();
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount), // $99.00 in cents
        currency: 'USD',
      },
      customerId: squareCustomerId, // Link payment to Square Customer Profile
      autocomplete: true,
      note: `Dispatch Fee - ${customerDetails.name}`,
    });

    const payment = JSON.parse(JSON.stringify(response.result.payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    // 3. Create/Find Customer & Service Request in Payload
    const payload = await getPayload({ config: configPromise });
    
    // Check if customer exists in Payload
    const existingCustomers = await payload.find({
        collection: 'customers',
        where: {
            email: { equals: customerDetails.email }
        }
    });

    let payloadCustomerId;

    if (existingCustomers.totalDocs > 0) {
        const existing = existingCustomers.docs[0];
        payloadCustomerId = existing.id;
        
        // Update Payload customer with Square ID if missing
        if (!existing.squareCustomerId && squareCustomerId) {
            await payload.update({
                collection: 'customers',
                id: existing.id,
                data: { squareCustomerId }
            });
        }
    } else {
        const newCustomer = await payload.create({
            collection: 'customers',
            data: {
                email: customerDetails.email,
                password: randomUUID(),
                name: customerDetails.name,
                phone: customerDetails.phone,
                address: customerDetails.address,
                squareCustomerId: squareCustomerId, // Save the link
            }
        });
        payloadCustomerId = newCustomer.id;
    }

    // 4. Create Service Request
    const newTicket = await payload.create({
        collection: 'service-requests',
        data: {
            customer: payloadCustomerId,
            issueDescription: customerDetails.issue,
            urgency: customerDetails.urgency === 'Emergency' ? 'emergency' : 'standard',
            status: 'confirmed', // Confirmed = Paid
            tripFeePayment: payment,
        }
    });

    return { success: true, payment, ticket: newTicket };

  } catch (error: any) {
    console.error('Payment/Booking Error:', error);
    return { 
        success: false, 
        error: error.result?.errors?.[0]?.detail || error.message || 'Payment failed' 
    };
  }
}
