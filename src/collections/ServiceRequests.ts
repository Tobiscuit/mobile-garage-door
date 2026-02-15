import type { CollectionConfig } from 'payload';

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'ticketId',
    group: 'Portal',
    defaultColumns: ['ticketId', 'customer', 'status', 'urgency', 'createdAt'],
  },
  access: {
    // Admins and Technicians can read all
    // Customers can read their own
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'technician' || user?.role === 'dispatcher') return true;
      if (user?.role === 'customer') return { customer: { equals: user.id } };
      return false;
    },
    // Anyone logged in can create (customers create requests)
    create: ({ req: { user } }) => !!user, 
    // Only admins/techs can update status (customers can cancel maybe? but for now strict)
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'technician', 
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
            if (operation === 'create' && !value) {
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
      // Removed filterOptions to allow any user to be a customer if needed, 
      // but ideally we filter by role 'customer'. Keeping it simple for now.
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
