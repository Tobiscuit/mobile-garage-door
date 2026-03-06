import { createAuth } from "@/lib/auth";
import { getCloudflareContext } from "@/lib/cloudflare";

// We have to dynamically create the auth handler per-request in Cloudflare Workers
// because the DB binding only exists on the request context
const getHandler = async (request: Request) => {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env);
  return auth.handler;
};

export async function GET(request: Request) {
  const handler = await getHandler(request);
  return handler(request);
}

export async function POST(request: Request) {
  const handler = await getHandler(request);
  return handler(request);
}
