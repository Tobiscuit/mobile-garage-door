import { KVCacheHandler } from "vinext/cloudflare";
import { setCacheHandler } from "next/cache";
import handler from "vinext/server/app-router-entry";

interface Env {
  VINEXT_CACHE: KVNamespace;
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    setCacheHandler(new KVCacheHandler(env.VINEXT_CACHE, {
      appPrefix: "mobile-garage-door",
    }));
    return handler.fetch(request);
  },
};
