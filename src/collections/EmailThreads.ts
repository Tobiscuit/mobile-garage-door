import type { CollectionConfig } from 'payload';

export const EmailThreads: CollectionConfig = {
  slug: 'email-threads',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'lastMessageAt'],
  },
  access: {
    read: () => true, // TODO: Restrict to admins and participants
    create: () => true, // TODO: Restrict to admins and system (webhooks)
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'open',
      required: true,
      index: true,
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
