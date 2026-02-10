import type { CollectionConfig } from 'payload';

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Portal',
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins can read all
      if (user?.collection === 'users') return true;
      // Customers can only read themselves
      if (user?.collection === 'customers') return { id: { equals: user.id } };
      return false;
    },
    update: ({ req: { user } }) => {
      if (user?.collection === 'users') return true;
      if (user?.collection === 'customers') return { id: { equals: user.id } };
      return false;
    },
    delete: ({ req: { user } }) => user?.collection === 'users',
    create: () => true, // Allow public registration
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'textarea', // Allows for multiline address
    },
    {
      name: 'squareCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
};
