/* This file renders the main Admin UI */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@/payload.config';
import { importMap } from '../importMap';

/* Export metadata for the Admin Panel */
export { generatePageMetadata as generateMetadata };

/* Ensure dynamic rendering for Admin Panel to avoid Suspense/Blocking Route errors */
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ params, searchParams }: PageProps) => {
  console.log('[Page] Awaiting config...');
  try {
    const resolvedConfig = await config;
    console.log('[Page] Config resolved:', resolvedConfig ? 'YES' : 'NO');
    if (!resolvedConfig) {
       console.error('[Page] CRITICAL: Config is undefined!');
       throw new Error('Config failed to load');
    }
    console.log('[Page] Collections:', resolvedConfig.collections?.map(c => c.slug));

  return RootPage({ 
    config: Promise.resolve(resolvedConfig),  
    importMap,
    params, 
    searchParams: searchParams as Promise<{ [key: string]: string | string[] }> 
  });
  } catch (error) {
    console.error('[Page] Error resolving config:', error);
    throw error;
  }
};

export default Page;
