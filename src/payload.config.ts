import { buildConfig } from 'payload';

// SQLite removed
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Collections
import { Services } from './collections/Services';
import { Projects } from './collections/Projects';
import { Testimonials } from './collections/Testimonials';
import { Posts } from './collections/Posts';
import { Customers } from './collections/Customers';
import { ServiceRequests } from './collections/ServiceRequests';
import { Invoices } from './collections/Invoices';
import { Payments } from './collections/Payments';

// Globals
import { SiteSettings } from './globals/SiteSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

console.log('--- [PAYLOAD CONFIG] Initializing... ---');
console.log('--- [PAYLOAD CONFIG] DB URI:', process.env.DATABASE_URI);

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      access: {
        delete: () => false,
        update: () => true,
      },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    Services,
    Projects,
    Testimonials,
    Posts,
    Customers,
    ServiceRequests,
    Invoices,
    Payments,
  ],
  globals: [
    SiteSettings,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-do-not-use-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
});
