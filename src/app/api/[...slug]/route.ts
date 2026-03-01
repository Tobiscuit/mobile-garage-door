import { REST_DELETE, REST_GET, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes';
import configPromise from '@/payload.config';
import { connection } from 'next/server';

export const DELETE = async (req: any, args: any) => { await connection(); return REST_DELETE(configPromise)(req, args); };
export const GET = async (req: any, args: any) => { await connection(); return REST_GET(configPromise)(req, args); };
export const POST = async (req: any, args: any) => { await connection(); return REST_POST(configPromise)(req, args); };
export const PATCH = async (req: any, args: any) => { await connection(); return REST_PATCH(configPromise)(req, args); };
export const PUT = async (req: any, args: any) => { await connection(); return REST_PUT(configPromise)(req, args); };
