import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  access: {
    delete: () => false,
    update: () => true, // Admins can update
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Technician', value: 'technician' },
        { label: 'Dispatcher', value: 'dispatcher' },
        { label: 'Customer', value: 'customer' },
      ],
      required: true,
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
  ],
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              lastLogin: new Date().toISOString(),
            } as any,
          })
        } catch (err) {
          console.error('Error updating lastLogin for user:', user.id, err)
        }
        return user
      },
    ],
  },
}
