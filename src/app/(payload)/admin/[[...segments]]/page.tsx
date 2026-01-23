/* This file renders the main Admin UI */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@/payload.config';

import { importMap } from '@/app/(payload)/admin/importMap';

/* Export metadata for the Admin Panel */
export { generatePageMetadata as generateMetadata };

/* Ensure dynamic rendering for Admin Panel to avoid Suspense/Blocking Route errors */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ params, searchParams }: PageProps) => {
  const resolvedConfig = await config;
  
  return RootPage({ 
    config: Promise.resolve(resolvedConfig), 
    importMap,
    params, 
    searchParams: searchParams as Promise<{ [key: string]: string | string[] }> 
  });
};

export default Page;
