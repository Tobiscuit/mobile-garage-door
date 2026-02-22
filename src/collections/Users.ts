import type { CollectionConfig } from 'payload'

type AccessUser = {
  id: string | number
  role?: string
} | null | undefined

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  access: {
    // Anyone can create a user (signup), but roles are protected by field-level access
    create: () => true,
    // Only admins can delete
    delete: ({ req: { user } }) => (user as AccessUser)?.role === 'admin',
    // Admins can update anyone, users can update themselves
    update: ({ req: { user } }) => {
        if ((user as AccessUser)?.role === 'admin') return true;
        if (user) return { id: { equals: user.id } };
        return false;
    },
    // Admins read all, users read themselves
    read: ({ req: { user } }) => {
        if ((user as AccessUser)?.role === 'admin' || (user as AccessUser)?.role === 'dispatcher') return true;
        if (user) return { id: { equals: user.id } };
        return false;
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'customer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Technician', value: 'technician' },
        { label: 'Dispatcher', value: 'dispatcher' },
        { label: 'Customer', value: 'customer' },
      ],
      required: true,
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === 'admin',
        // Only admins can set roles on create (others get default)
        create: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'customerType',
      type: 'select',
      defaultValue: 'residential',
      options: [
        { label: 'Residential (Homeowner)', value: 'residential' },
        { label: 'Commercial / Builder', value: 'builder' },
      ],
      admin: {
        description: 'Classifies the customer for portal experience (B2B vs B2C)',
      },
    },
    {
      name: 'companyName',
      type: 'text',
      admin: {
        condition: (data) => data.customerType === 'builder',
      },
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'pushSubscription',
      type: 'json', // Storing the full subscription object
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'squareCustomerId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  // Removed afterLogin hook to prevent Postgres transaction timeouts during native login
}
