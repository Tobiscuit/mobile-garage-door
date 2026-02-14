import type { CollectionConfig } from 'payload';

export const Payments: CollectionConfig = {
    slug: 'payments',
    admin: {
      useAsTitle: 'squarePaymentId',
      group: 'Finance',
    },
    access: {
      read: ({ req: { user } }) => !!user, // Allow any logged in user (technicians need to see earnings?) or restrict to admin
      create: ({ req: { user } }) => user?.role === 'admin',
      update: ({ req: { user } }) => user?.role === 'admin',
      delete: ({ req: { user } }) => user?.role === 'admin',
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
          type: 'text', // CARD, CASH, EXTERNAL
      },
      {
          name: 'note',
          type: 'textarea',
          admin: {
              description: 'Optional note for manual payments',
          }
      },
    ],
  };
