import { toNextJsHandler } from "better-auth/next-js";
import { createAuth } from "@/lib/auth";
import { getCloudflareContext } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env);
  return toNextJsHandler(auth).GET(request);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const auth = createAuth(env);
  return toNextJsHandler(auth).POST(request);
}
