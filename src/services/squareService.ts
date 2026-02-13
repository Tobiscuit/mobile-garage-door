import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

export const squareService = {
  processPayment: async (sourceId: string, amount: number, note: string) => {
    try {
      const response = await squareClient.payments.create({
        sourceId,
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: BigInt(amount),
          currency: 'USD',
        },
        note,
      });

      if (!response.payment || (response.payment.status !== 'COMPLETED' && response.payment.status !== 'APPROVED')) {
        throw new Error('Payment failed. Status: ' + response.payment?.status);
      }

      return response.payment;
    } catch (error: any) {
      console.error('Square Service Error:', error);

      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        throw new Error(error.errors[0].detail);
      } else if (error.body && error.body.errors) {
        throw new Error(error.body.errors[0].detail);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Unknown Square payment error');
    }
  }
};
