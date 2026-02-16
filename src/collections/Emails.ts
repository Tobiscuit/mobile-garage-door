import type { CollectionConfig } from 'payload';

export const Emails: CollectionConfig = {
  slug: 'emails',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'from', 'to', 'createdAt'],
  },
  access: {
    read: () => true, // TODO: Restrict to admins and thread participants
    create: () => true, // TODO: Restrict to admins and system (webhooks)
    update: () => false, // Emails should be immutable
    delete: () => true, // Admins only
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'subject', // De-normalized from thread for easier searching
      type: 'text',
      index: true,
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'bodyRaw', // Valid for storing simple text or raw, unprocessed content
      type: 'textarea',
    },
    {
      name: 'thread',
      type: 'relationship',
      relationTo: 'email-threads',
      required: true,
      index: true,
    },
    {
      name: 'direction',
      type: 'select',
      options: [
        { label: 'Inbound', value: 'inbound' },
        { label: 'Outbound', value: 'outbound' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'rawMetadata',
      type: 'json',
      admin: {
        description: 'Raw headers and message-id for debugging',
      },
    },
    {
      name: 'messageId',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
