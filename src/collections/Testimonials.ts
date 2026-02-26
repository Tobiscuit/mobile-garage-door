import type { CollectionConfig } from 'payload';
import { autoTranslateHook } from '../hooks/auto-translate';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'location', 'rating', 'featured'],
    group: 'Content',
  },
  hooks: {
    afterChange: [autoTranslateHook],
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Review Text',
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      label: 'Customer Name',
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      localized: true,
      label: 'City / Area',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on Homepage',
      defaultValue: false,
    },
  ],
};
