import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDB(d1: D1Database | null) {
  if (!d1) {
    // Return a proxy that throws helpful errors when methods are called
    // This happens in local dev without Cloudflare Workers
    return null;
  }
  return drizzle(d1, { schema });
}
