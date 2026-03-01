import { toNextJsHandler } from 'better-auth/next-js';
import { getPayload } from '@/lib/payload';

export async function GET(request: Request) {
  const payload = await getPayload();
  const handlers = toNextJsHandler(payload.betterAuth);
  return handlers.GET(request);
}

export async function POST(request: Request) {
  const payload = await getPayload();
  const handlers = toNextJsHandler(payload.betterAuth);
  return handlers.POST(request);
}
