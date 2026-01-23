/* This file renders the main Admin UI */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@/payload.config';

/* Export metadata for the Admin Panel */
export { generatePageMetadata as generateMetadata };

interface PageProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = ({ params, searchParams }: PageProps) => {
  return RootPage({ 
    config, 
    params, 
    searchParams 
  });
};

export default Page;
