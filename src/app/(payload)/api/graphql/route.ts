import { GRAPHQL_PLAYGROUND_GET, GRAPHQL_POST } from '@payloadcms/next/routes';
import configPromise from '@/payload.config';
import { connection } from 'next/server';

export const GET = async (req: any) => { await connection(); return GRAPHQL_PLAYGROUND_GET(configPromise)(req); };
export const POST = async (req: any) => { await connection(); return GRAPHQL_POST(configPromise)(req); };
