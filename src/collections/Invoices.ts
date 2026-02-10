import type { CollectionConfig } from 'payload';

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'squareInvoiceId',
    group: 'Finance',
  },
  access: {
    read: ({ req: { user } }) => {
        if (user?.collection === 'users') return true;
        // If linked to a customer, allow them to read
        if (user?.collection === 'customers') return { 'customer.email': { equals: user.email } }; // Simplified check, ideally relation based
        return false;
    },
    create: () => false, // Created via Webhook only
    update: () => false, // Updated via Webhook only
    delete: () => false,
  },
  fields: [
    {
      name: 'squareInvoiceId',
      type: 'text',
      unique: true,
      required: true,
    },
    {
       name: 'orderId',
       type: 'text',
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
        name: 'status',
        type: 'text', // PAID, OPEN, VOIDED
    },
    {
        name: 'customerEmail',
        type: 'text',
    },
    {
        name: 'publicUrl',
        type: 'text',
    },
  ],
};
