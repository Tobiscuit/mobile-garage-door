/* This file renders the main Admin UI */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@/payload.config';

import { importMap } from '@/app/(payload)/admin/importMap';

/* Export metadata for the Admin Panel */
export { generatePageMetadata as generateMetadata };

interface PageProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = ({ params, searchParams }: PageProps) => {
  return RootPage({ 
    config, 
    importMap,
    params, 
    searchParams: searchParams as Promise<{ [key: string]: string | string[] }> 
  });
};

export default Page;
