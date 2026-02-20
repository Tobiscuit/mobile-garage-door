import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload';
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical';
import { JSDOM } from 'jsdom';
import configPromise from '@payload-config';

const htmlToLexicalHook: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (data.htmlContent) {
    req.payload.logger.info(`Converting AI htmlContent to Lexical AST for post: ${data.slug}`);
    try {
      const lexicalJSON = await convertHTMLToLexical({
        editorConfig: await editorConfigFactory.default({
          config: await configPromise,
        }),
        html: data.htmlContent,
        JSDOM,
      });

      // Populate Lexical field for Admin UI
      data.content = lexicalJSON;
      // We keep htmlContent to serve as the source of truth for the Custom Dashboard Tiptap Editor
      // and for the frontend to render perfect HTML.
    } catch (err) {
      req.payload.logger.error({ err }, "Failed to parse HTML to Lexical");
    }
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeChange: [htmlToLexicalHook],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
    group: 'Content',
  },
  fields: [
    {
      name: 'aiWriter',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/features/payload/AIWriter.tsx#AIWriter' as any,
        },
      },
    },
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
      label: 'Manual Article Content (Lexical)',
      admin: {
        description: 'Used for manual writing.'
      }
    },
    {
      name: 'htmlContent',
      type: 'code',
      admin: {
        language: 'html',
        description: 'Autonomously generated semantic HTML content. If present, the frontend uses this instead of the Manual Content.'
      }
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
