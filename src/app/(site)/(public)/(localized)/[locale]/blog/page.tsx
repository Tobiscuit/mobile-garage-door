import React from 'react';
import type { Metadata } from 'next';
import { getDB } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import BlogFeaturedImage from '@/features/blog/BlogFeaturedImage';
import SmartLink from '@/shared/ui/SmartLink';
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';
import { formatDate, isoDate } from '@/lib/seo/dates';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = (await params) || { locale: 'en' };
    return pageMetadata({
        locale,
        path: '/blog',
        title: { key: 'blog_title' },
        description: { key: 'blog_description' },
    });
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = (await params) || { locale: 'en' } as any;
    const locale = resolvedParams.locale || 'en';
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const t = await getTranslations({ locale, namespace: 'blog_page' });

    const posts = await db.query.posts.findMany({
        where: eq(postsTable.status, 'published'),
        orderBy: [desc(postsTable.publishedAt)],
        with: {
            featuredImage: true
        }
    });

    return (
        <div className="page">
            <section className="section section--snug" aria-labelledby="blog-title">
                <div className="wrap wrap--wide stack">
                    <p className="eyebrow">{t('badge')}</p>
                    <h1 id="blog-title" className="title-1">{t('heading')}</h1>
                    <p className="lead muted">{t('subheading')}</p>
                </div>
            </section>

            <section className="section surface-tint" aria-labelledby="blog-title">
                <div className="wrap wrap--wide">
                    {posts.length === 0 ? (
                        <div className="card stack">
                            <p className="title-4">{t('no_articles')}</p>
                            <p className="muted">{t('check_back')}</p>
                        </div>
                    ) : (
                        <ul className="post-grid">
                            {posts.map((post) => {
                                const date = post.publishedAt || post.createdAt;
                                return (
                                    <li key={post.id}>
                                        <SmartLink href={`/blog/${post.slug}`} className="post-card">
                                            <div className="post-card__media">
                                                {post.featuredImage?.url ? (
                                                    <BlogFeaturedImage
                                                        src={post.featuredImage.url}
                                                        alt={post.featuredImage.alt || post.title}
                                                        className="object-cover"
                                                        sizes="(min-width: 90em) 26rem, (min-width: 48em) 50vw, 100vw"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="post-card__body">
                                                <div className="cluster" style={{ '--cluster-space': 'var(--space-2xs)' } as React.CSSProperties}>
                                                    {post.category && <span className="chip">{post.category.replace(/-/g, ' ')}</span>}
                                                    <time className="fine-print" dateTime={isoDate(date)}>{formatDate(date, locale)}</time>
                                                </div>
                                                <h2 className="post-card__title">{post.title}</h2>
                                                {post.excerpt && <p className="muted">{post.excerpt}</p>}
                                                <span className="post-card__more" aria-hidden="true">{t('read_article')} →</span>
                                            </div>
                                        </SmartLink>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
