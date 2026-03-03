import { g as getCloudflareContext, a as getDB, m as media, r as registerServerReference } from "./worker-entry-D7PYXyDz.js";
import "node:events";
import "node:async_hooks";
import "../__vite_rsc_assets_manifest.js";
import "stream";
import "http";
import "url";
import "punycode";
import "https";
import "zlib";
import "fs";
import "buffer";
import "events";
import "util";
import "path";
import "crypto";
async function uploadMedia(formData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  const file = formData.get("file");
  if (!file) {
    return { error: "No file provided" };
  }
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `media/${Date.now()}-${file.name}`;
    await env.MEDIA_BUCKET.put(key, buffer, {
      httpMetadata: { contentType: file.type }
    });
    const url = `/media/${key}`;
    const newMedia = await db.insert(media).values({
      filename: file.name,
      mimeType: file.type,
      filesize: file.size,
      alt: formData.get("alt") || file.name || "Dashboard Upload",
      url
    }).returning();
    return { success: true, doc: newMedia[0] };
  } catch (error) {
    console.error("Upload Error:", error);
    return { error: "Failed to upload image" };
  }
}
uploadMedia = /* @__PURE__ */ registerServerReference(uploadMedia, "70756686dd13", "uploadMedia");
export {
  uploadMedia
};
