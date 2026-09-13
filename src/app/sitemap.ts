import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { getDB } from '@/db';
import { posts, projects } from '@/db/schema';
import { getCloudflareContext } from '@/lib/cloudflare';
import {
  LOCALES,
  PUBLIC_PAGE_PATHS,
  absoluteUrl,
  blogPostPath,
  languageAlternates,
  localizedPath,
  projectPath,
} from '@/lib/seo/site';

/**
 * /sitemap.xml, built per request (vinext only prerenders "use cache" metadata
 * routes), so newly published posts and projects appear without a deploy.
 *
 * Every URL is listed in every locale with its reciprocal alternates,
 * including x-default. `lastmod` comes only from records' updated_at — Google
 * uses it only when "consistently and verifiably accurate" — and there is no
 * changefreq or priority, which Google ignores.
 */
function entriesFor(path: string, lastModified?: string): MetadataRoute.Sitemap {
  const languages = languageAlternates(path);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(localizedPath(locale, path)),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = PUBLIC_PAGE_PATHS.flatMap((path) => entriesFor(path));

  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    if (db) {
      const publishedPosts = await db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt })
        .from(posts)
        .where(eq(posts.status, 'published'));
      const allProjects = await db.select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects);

      for (const post of publishedPosts) entries.push(...entriesFor(blogPostPath(post.slug), post.updatedAt));
      for (const project of allProjects) {
        if (project.slug) entries.push(...entriesFor(projectPath(project.slug), project.updatedAt));
      }
    }
  } catch (error) {
    // The static pages are still worth serving if the database is unreachable.
    console.error('[sitemap] could not read posts or projects:', error);
  }

  return entries;
}
