import type { CollectionConfig } from 'payload';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
    group: 'Content',
    components: {
       edit: {
         // Inject a custom component into the Edit View to trigger AI generation
         // This is a placeholder for where the AI Button would go in a full implementation
       }
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly ID for the article',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Short Summary',
      admin: {
        description: 'Brief description for sharing and previews',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Article Content',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Repair Tips', value: 'repair-tips' },
        { label: 'Product Spotlight', value: 'product-spotlight' },
        { label: 'Contractor Insights', value: 'contractor-insights' },
        { label: 'Maintenance Guide', value: 'maintenance-guide' },
        { label: 'Industry News', value: 'industry-news' },
      ],
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Topics Covered',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    // AI Generation fields - stores the quick notes for expansion
    {
      name: 'quickNotes',
      type: 'textarea',
      label: 'Quick Notes (for AI)',
      admin: {
        description: 'Jot down a few lines and click "Write Full Article" to expand',
      },
    },
  ],
};
