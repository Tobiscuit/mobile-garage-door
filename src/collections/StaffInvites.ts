import type { CollectionConfig } from 'payload';

type AccessUser = {
  role?: string;
} | null | undefined;

const isAdmin = (user: AccessUser) => user?.role === 'admin';

export const StaffInvites: CollectionConfig = {
  slug: 'staff-invites',
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['email', 'role', 'status', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => isAdmin(user as AccessUser),
    read: ({ req: { user } }) => isAdmin(user as AccessUser),
    update: ({ req: { user } }) => isAdmin(user as AccessUser),
    delete: ({ req: { user } }) => isAdmin(user as AccessUser),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'technician',
      options: [
        { label: 'Technician', value: 'technician' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Revoked', value: 'revoked' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create') {
          return {
            ...data,
            email: String(data.email || '').toLowerCase().trim(),
            invitedBy: req.user?.id,
          };
        }
        if (data?.email) {
          return {
            ...data,
            email: String(data.email).toLowerCase().trim(),
          };
        }
        return data;
      },
    ],
  },
};
