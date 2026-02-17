import type { CollectionConfig } from 'payload';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'location', 'updatedAt'],
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Project Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly ID (e.g., "commercial-fleet-hq")',
      },
    },
    {
      name: 'client',
      type: 'text',
      required: true,
      label: 'Client / Type',
      admin: {
        description: 'E.g., "Regional Distribution Center" or "Private Residence"',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      admin: {
        description: 'Service area (e.g., "Industrial Park, Sector 4")',
      },
    },
    {
      name: 'completionDate',
      type: 'date',
      label: 'Completion Date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'installDate',
      type: 'date',
      label: 'Installation Date',
      admin: {
        position: 'sidebar',
        description: 'Used for warranty tracking',
      },
    },
    {
      name: 'warrantyExpiration',
      type: 'date',
      label: 'Labor Warranty Expiration',
      admin: {
        position: 'sidebar',
        description: 'Triggers automated checkup email',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-calculate 1 year from installDate if not set
            if (!value && data?.installDate) {
              const date = new Date(data.installDate);
              date.setFullYear(date.getFullYear() + 1);
              return date.toISOString();
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Case Study Details',
      admin: {
        description: 'Main body content (Rich Text)',
      },
    },
    {
      name: 'challenge',
      type: 'richText',
      required: true,
      label: 'The Challenge',
      admin: {
        description: 'What problem was the client facing?',
      },
    },
    {
      name: 'solution',
      type: 'richText',
      required: true,
      label: 'Our Solution',
      admin: {
        description: 'How did we fix it?',
      },
    },
    {
      name: 'imageStyle',
      type: 'select',
      required: true,
      label: 'Image Pattern',
      options: [
        { label: 'Steel / Industrial', value: 'garage-pattern-steel' },
        { label: 'Glass / Modern', value: 'garage-pattern-glass' },
        { label: 'Carriage / Classic', value: 'garage-pattern-carriage' },
        { label: 'Modern / Contemporary', value: 'garage-pattern-modern' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Project Photo (optional)',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Category Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Key Metrics',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'E.g., "Install Time", "Efficiency Gain"',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'E.g., "6 Hours", "+40%"',
          },
        },
      ],
    },
  ],
};
