import { getDB } from '@/db';
import { posts } from '@/db/schema';
import { getCloudflareContext } from '@/lib/cloudflare';
import { eq, or } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * GET /api/blog/titles
 * Returns all existing post titles for deduplication.
 * Called by the SEO engine during topic ideation to avoid generating
 * topics that overlap with already-written content.
 * 
 * Protected by the same SEO_ENGINE_API_KEY used by the draft endpoint.
 */
export async function GET(request: Request) {
  const { env } = await getCloudflareContext();

  // Authenticate — same shared secret as draft endpoint
  const apiKey = request.headers.get('x-seo-engine-key');
  if (!apiKey || apiKey !== (env as any).SEO_ENGINE_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDB(env.DB);

  // Get ALL post titles (published + pending_review + draft)
  // so we never regenerate anything that exists in any state
  const allPosts = await db.select({
    title: posts.title,
    slug: posts.slug,
  }).from(posts);

  return Response.json({
    titles: allPosts.map(p => p.title).filter(Boolean),
    slugs: allPosts.map(p => p.slug).filter(Boolean),
  });
}
