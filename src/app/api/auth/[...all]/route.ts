import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";
import { getCloudflareContext } from "vinext/cloudflare";

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env.DB);
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env.DB);
  return toNextJsHandler(auth).POST(request);
}
