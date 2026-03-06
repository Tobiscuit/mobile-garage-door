import { SquareClient, SquareEnvironment } from 'square';
import { randomUUID } from 'crypto';
import { getCloudflareContext } from "@/lib/cloudflare";

// SquareClient is dynamically instantiated inside functions that need it using getCloudflareContext().env

export const squareService = {
  processPayment: async (sourceId: string, amount: number, note: string) => {
    try {
      const { env } = await getCloudflareContext();
      const squareClient = new SquareClient({
        token: env.SQUARE_ACCESS_TOKEN,
        environment: env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      });

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
