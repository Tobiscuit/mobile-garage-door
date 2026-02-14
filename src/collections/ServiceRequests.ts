import type { CollectionConfig } from 'payload';

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'ticketId',
    group: 'Portal',
    defaultColumns: ['ticketId', 'customer', 'status', 'urgency', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.collection === 'users') return true;
      if (user?.collection === 'customers') return { customer: { equals: user.id } };
      return false;
    },
    create: ({ req: { user } }) => !!user, // Must be logged in
    update: ({ req: { user } }) => user?.collection === 'users', // Only admins update status
  },
  fields: [
    {
      name: 'ticketId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create') {
              // Simple ID generation: SR-TIMESTAMP-RANDOM
              return `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      filterOptions: {
        role: { equals: 'customer' },
      },
    },
    {
      name: 'issueDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'urgency',
      type: 'select',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Emergency (24/7)', value: 'emergency' },
      ],
      defaultValue: 'standard',
    },
    {
      name: 'scheduledTime',
      type: 'date',
      admin: {
         date: {
             pickerAppearance: 'dayAndTime',
         }
      }
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Payment', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Dispatched', value: 'dispatched' },
        { label: 'On Site', value: 'on_site' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'assignedTech',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: { equals: 'technician' },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tripFeePayment',
      type: 'json',
      admin: {
        readOnly: true,
      },
    },
  ],
};
