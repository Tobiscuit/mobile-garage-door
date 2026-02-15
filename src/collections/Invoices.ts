import type { CollectionConfig } from 'payload';

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'squareInvoiceId',
    group: 'Finance',
  },
  access: {
    read: ({ req: { user } }) => {
        if (user?.role === 'admin') return true;
        // If linked to a customer, allow them to read
        if (user?.role === 'customer') return { 'customer.email': { equals: user.email } }; 
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
        name: 'customer', 
        type: 'relationship', 
        relationTo: 'users',
    },
    {
        name: 'publicUrl',
        type: 'text',
    },
  ],
};
