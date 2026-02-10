import { buildConfig } from 'payload';

import { postgresAdapter } from '@payloadcms/db-postgres';
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

// Custom Branding Components
// import Logo from './components/payload/Logo';
// import Icon from './components/payload/Icon';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

console.log('--- [PAYLOAD CONFIG] Initializing... ---');
console.log('--- [PAYLOAD CONFIG] DB URI:', process.env.DATABASE_URI ? 'FOUND' : 'MISSING');
console.log('--- [PAYLOAD CONFIG] PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'FOUND (length: ' + process.env.PAYLOAD_SECRET.length + ')' : 'MISSING');

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Mobil Garage Admin',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
      ],
      openGraph: {
        images: [
          {
            url: '/images/social/og-image.png',
          },
        ],
      },
    },
    components: {
      graphics: {
        Logo: {
          path: '/src/components/payload/Logo.tsx#default',
          exportName: 'default',
        },
        Icon: {
          path: '/src/components/payload/Icon.tsx#default',
          exportName: 'default',
        },
      },
      views: {
        dashboard: {
          Component: {
            path: '/src/components/payload/CustomDashboard.tsx#default',
            exportName: 'default',
          },
        },
      },
    },
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
