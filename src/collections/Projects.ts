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
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Case Study Details',
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
