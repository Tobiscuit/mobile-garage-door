import type { CollectionConfig } from 'payload';

export const Payments: CollectionConfig = {
    slug: 'payments',
    admin: {
      useAsTitle: 'squarePaymentId',
      group: 'Finance',
      relationTo: 'invoices' as any,
    },
    access: {
      read: ({ req: { user } }) => user?.collection === 'users',
      create: () => false,
      update: () => false,
      delete: () => false,
    },
    fields: [
      {
        name: 'squarePaymentId',
        type: 'text',
        unique: true,
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
      },
      {
          name: 'currency',
          type: 'text',
      },
      {
          name: 'status',
          type: 'text', // COMPLETED, FAILED
      },
      {
          name: 'sourceType',
          type: 'text', // CARD, CASH
      },
    ],
  };
