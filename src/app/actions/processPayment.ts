'use server';

import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square Client
// NOTE: In production, switch environment to Environment.Production
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox, 
});

export async function processPayment(sourceId: string, amount: number = 9900) {
  try {
    const { paymentsApi } = squareClient;
    
    // Idempotency Key ensures we don't charge twice for the same click
    const idempotencyKey = randomUUID();

    const response = await paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount), // $99.00 in cents
        currency: 'USD',
      },
      autocomplete: true, // Capture immediately
      note: 'Dispatch Fee - Mobile Garage Door',
    });

    // Handle BigInt serialization for Client Component
    const payment = JSON.parse(JSON.stringify(response.result.payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    return { success: true, payment };

  } catch (error: any) {
    console.error('Square Payment Error:', error);
    return { 
        success: false, 
        error: error.result?.errors?.[0]?.detail || error.message || 'Payment failed' 
    };
  }
}
