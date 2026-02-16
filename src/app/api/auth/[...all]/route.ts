import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';
import { ensureAuthTablesReady } from '@/lib/ensure-auth-tables';

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  await ensureAuthTablesReady;
  return handlers.GET(request);
}

export async function POST(request: Request) {
  await ensureAuthTablesReady;
  return handlers.POST(request);
}
