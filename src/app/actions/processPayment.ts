'use server';

import { SquareClient } from 'square';
import { randomUUID } from 'crypto';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Initialize Square Client
// NOTE: In production, switch environment to 'production'
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: 'sandbox', 
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
    // 1. Process Payment
    const idempotencyKey = randomUUID();
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount), // $99.00 in cents
        currency: 'USD',
      },
      autocomplete: true,
      note: `Dispatch Fee - ${customerDetails.name}`,
    });

    const payment = JSON.parse(JSON.stringify(response.payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    // 2. Create/Find Customer & Service Request
    const payload = await getPayload({ config: configPromise });
    
    // Check if customer exists
    const existingCustomers = await payload.find({
        collection: 'customers',
        where: {
            email: { equals: customerDetails.email }
        }
    });

    let customerId;

    if (existingCustomers.totalDocs > 0) {
        customerId = existingCustomers.docs[0].id;
        // Optionally update phone/address if needed
    } else {
        const newCustomer = await payload.create({
            collection: 'customers',
            data: {
                email: customerDetails.email,
                password: randomUUID(), // Generate random password for now
                name: customerDetails.name,
                phone: customerDetails.phone,
                address: customerDetails.address,
            }
        });
        customerId = newCustomer.id;
    }

    // Create Service Request
    const newTicket = await payload.create({
        collection: 'service-requests',
        data: {
            customer: customerId,
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
