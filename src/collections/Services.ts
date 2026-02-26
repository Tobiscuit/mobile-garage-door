import type { CollectionConfig } from 'payload';
import { autoTranslateHook } from '../hooks/auto-translate';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order', 'highlight'],
    group: 'Content',
  },
  hooks: {
    afterChange: [autoTranslateHook],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Service Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly ID (e.g., "precision-repair")',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Category tag (e.g., "Critical Response", "Smart Home")',
      },
    },
    {
      name: 'price',
      type: 'number',
      label: 'Base Price ($)',
      admin: {
        description: 'Starting price for this service',
      },
      },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Short Description',
    },
    {
      name: 'features',
      type: 'array',
      label: 'Key Features',
      localized: true,
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: [
        { label: 'Lightning (Repair)', value: 'lightning' },
        { label: 'Building (Install)', value: 'building' },
        { label: 'Clipboard (Maintenance)', value: 'clipboard' },
        { label: 'Phone (Automation)', value: 'phone' },
      ],
    },
    {
      name: 'highlight',
      type: 'checkbox',
      label: 'Featured Service',
      defaultValue: false,
      admin: {
        description: 'Show with dark card styling',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower = first)',
      },
    },
  ],
};
