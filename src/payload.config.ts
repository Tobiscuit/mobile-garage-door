import { buildConfig } from 'payload';

import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { emailTransport } from './lib/email';

// Allow broad CORS for PWA/Manifest fetch
const cors = ['https://garage-door.jrcodex.dev', 'http://localhost:3000']; 


// Collections
import { Services } from './collections/Services';
import { Projects } from './collections/Projects';
import { Testimonials } from './collections/Testimonials';
import { Posts } from './collections/Posts';
import { ServiceRequests } from './collections/ServiceRequests';
import { Invoices } from './collections/Invoices';
import { Payments } from './collections/Payments';
import { Users } from './collections/Users';
import { StaffInvites } from './collections/StaffInvites';
import { EmailThreads } from './collections/EmailThreads';
import { Emails } from './collections/Emails';

// Globals
import { Settings } from './globals/Settings';

// Custom Branding Components
// import Logo from './components/payload/Logo';
// import Icon from './components/payload/Icon';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

console.log('--- [PAYLOAD CONFIG] Initializing... ---');
console.log('--- [PAYLOAD CONFIG] DB URI:', process.env.DATABASE_URI ? 'FOUND' : 'MISSING');
console.log('--- [PAYLOAD CONFIG] PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'FOUND (length: ' + process.env.PAYLOAD_SECRET.length + ')' : 'MISSING');

export default buildConfig({
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Español', code: 'es' },
      { label: 'Tiếng Việt', code: 'vi' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
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
          path: '/src/features/payload/Logo.tsx#default',
          exportName: 'default',
        },
        Icon: {
          path: '/src/features/payload/Icon.tsx#default',
          exportName: 'default',
        },
      },
    },
  },
  collections: [
    Users,
    StaffInvites,
    EmailThreads,
    Emails,
    {
      slug: 'media',
      upload: true,
      access: {
        read: () => true,
      },
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
    ServiceRequests,
    Invoices,
    Payments,
  ],
  globals: [
    Settings,
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
    push: false,
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        // Cloudflare R2 specific settings:
        forcePathStyle: true,
      },
    }),
  ],
  cors: cors,
  csrf: cors,
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SES_FROM_NOTIFY || 'dispatch@mobilegaragedoor.com',
    defaultFromName: 'Mobile Garage Door Dispatch',
    transport: emailTransport,
  }),
});
