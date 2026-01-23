/* This file renders the main Admin UI */
import type { Metadata } from 'next';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@/payload.config';
import { importMap } from '../importMap';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  return generatePageMetadata({ config, params, searchParams });
};

/* Ensure dynamic rendering for Admin Panel to avoid Suspense/Blocking Route errors */
export const dynamic = 'force-dynamic';

const Page = async ({ params, searchParams }: Args) => {
  return RootPage({ config, importMap, params, searchParams });
};

export default Page;
