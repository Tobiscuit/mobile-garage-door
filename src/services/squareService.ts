import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
});

export const squareService = {
  processPayment: async (sourceId: string, amount: number, note: string) => {
    try {
      const { result } = await squareClient.paymentsApi.createPayment({
        sourceId,
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: BigInt(amount),
          currency: 'USD',
        },
        note,
      });

      if (!result.payment || (result.payment.status !== 'COMPLETED' && result.payment.status !== 'APPROVED')) {
        throw new Error('Payment failed. Status: ' + result.payment?.status);
      }

      return result.payment;
    } catch (error: any) {
      console.error('Square Service Error:', error);
      if (error.result && error.result.errors) {
        // If it's an array of errors, take the first one
        throw new Error(error.result.errors[0].detail);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Unknown Square payment error');
    }
  }
};
