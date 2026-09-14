import React from 'react';
import type { Metadata } from 'next';
import { getDB } from "@/db";
import { posts as postsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from 'next/navigation';
import BlogFeaturedImage from '@/features/blog/BlogFeaturedImage';
import SmartLink from '@/shared/ui/SmartLink';
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/lib/seo/JsonLd';
import { BUSINESS, TEL_HREF, absoluteUrl, blogPostPath, localizedPath, resolveLocale } from '@/lib/seo/site';
import { blogPostingNode, graph } from '@/lib/seo/structured-data';
import { excerpt, plainText } from '@/lib/seo/text';
import { formatDate, isoDate } from '@/lib/seo/dates';

export const dynamic = 'force-dynamic';

// Basic Rich Text Renderer for Lexical
const RichTextRenderer = ({ content }: { content: any | string }) => {
    let parsedContent: any;
    if (typeof content === 'string') {
        try {
            parsedContent = JSON.parse(content);
        } catch (e) {
            return <div>{content}</div>;
        }
    } else {
        parsedContent = content;
    }

    if (!parsedContent || !parsedContent.root || !parsedContent.root.children) return null;

    const renderNode = (node: any, index: number) => {
        switch (node.type) {
            case 'paragraph':
                return (
                    <p key={index}>
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </p>
                );
            case 'heading':
                // The post title is the page's only h1; an authored h1 renders as h2.
                const Tag = (node.tag === 'h1' ? 'h2' : node.tag || 'h2') as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                return (
                    <Tag key={index}>
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </Tag>
                );
            case 'list':
                const ListTag = node.listType === 'number' ? 'ol' : 'ul';
                return (
                    <ListTag key={index}>
                        {node.children?.map((child: any, i: number) => (
                            <li key={i}>
                                {child.children?.map((c: any, j: number) => renderChild(c, j))}
                            </li>
                        ))}
                    </ListTag>
                );
            case 'quote':
                return (
                    <blockquote key={index}>
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </blockquote>
                );
            case 'link':
                return (
                    <a key={index} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined}>
                        {node.children?.map((child: any, i: number) => renderChild(child, i))}
                    </a>
                );
            default:
                if (node.children) {
                    return <div key={index}>{node.children.map((child: any, i: number) => renderChild(child, i))}</div>;
                }
                return null;
        }
    };

    const renderChild = (node: any, index: number) => {
        if (node.type === 'text') {
            let text = <span key={index}>{node.text}</span>;
            if (node.format & 1) text = <strong key={index}>{node.text}</strong>;
            if (node.format & 2) text = <em key={index}>{node.text}</em>;
            if (node.format & 8) text = <u key={index}>{node.text}</u>;
            if (node.format & 16) text = <code key={index}>{node.text}</code>;
            return text;
        }
        if (node.type === 'link') {
            return (
                <a key={index} href={node.fields?.url || '#'} target={node.fields?.newTab ? '_blank' : undefined}>
                    {node.children?.map((child: any, i: number) => renderChild(child, i))}
                </a>
            );
        }
        return renderNode(node, index);
    };

    return (
        <div>
            {parsedContent.root.children.map((node: any, index: number) => renderNode(node, index))}
        </div>
    );
};

async function loadPost(slug: string) {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    if (!db) return null;
    return db.query.posts.findFirst({
        where: eq(postsTable.slug, slug),
        with: {
            featuredImage: true
        }
    });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const { slug, locale } = await params;
    const post = await loadPost(slug);
    if (!post) {
        return pageMetadata({ locale, path: '/blog', title: { key: 'blog_title' }, description: { key: 'blog_description' }, noindex: true });
    }
    const description = post.excerpt || excerpt(plainText(post.htmlContent || post.content));
    return pageMetadata({
        locale,
        path: blogPostPath(post.slug),
        title: { text: post.title },
        description: description ? { text: description } : { key: 'blog_description' },
        type: 'article',
        publishedTime: isoDate(post.publishedAt || post.createdAt),
        image: post.featuredImage?.url
            ? {
                url: post.featuredImage.url,
                width: post.featuredImage.width ?? undefined,
                height: post.featuredImage.height ?? undefined,
                alt: post.featuredImage.alt || post.title,
            }
            : undefined,
        // Drafts stay reachable by URL as before, but out of search results.
        noindex: post.status !== 'published',
    });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    // loadPost returns null without a database, as the page's notFound() guard did before.
    const post = await loadPost(slug);
    if (!post) {
        return notFound();
    }
    const t = await getTranslations({ locale, namespace: 'blog_detail' });

    const date = post.publishedAt || post.createdAt;
    const structuredData = graph([
        blogPostingNode({
            headline: post.title,
            description: post.excerpt,
            imageUrl: post.featuredImage?.url,
            datePublished: isoDate(date),
            url: absoluteUrl(localizedPath(resolveLocale(locale), blogPostPath(post.slug))),
            locale: resolveLocale(locale),
        }),
    ]);

    return (
        <div className="page">
            <JsonLd data={structuredData} />
            <div className="reading-progress" aria-hidden="true"></div>

            {post.featuredImage?.url && (
                <div className="post-hero__media">
                    <BlogFeaturedImage
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                </div>
            )}

            <section className="section section--snug" aria-labelledby="post-title">
                <div className="wrap wrap--wide stack">
                    <SmartLink href="/blog" className="text-link">
                        <span aria-hidden="true">← </span>{t('back')}
                    </SmartLink>
                    <div className="cluster" style={{ '--cluster-space': 'var(--space-xs)' } as React.CSSProperties}>
                        {post.category && <span className="chip chip--accent">{post.category.replace(/-/g, ' ')}</span>}
                        <time className="muted" dateTime={isoDate(date)}>{formatDate(date, locale)}</time>
                    </div>
                    <h1 id="post-title" className="title-1">{post.title}</h1>
                    {post.excerpt && <p className="lead muted">{post.excerpt}</p>}
                </div>
            </section>

            <div className="wrap wrap--wide article-layout article-layout--padded">
                <article className="rich-text" aria-labelledby="post-title">
                    {post.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
                    ) : (
                        <RichTextRenderer content={post.content} />
                    )}

                    <div className="author not-prose">
                        <span className="initials" aria-hidden="true">MG</span>
                        <div>
                            <p><strong>{t('team_name')}</strong></p>
                            <p className="fine-print">{t('team_subtitle')}</p>
                        </div>
                    </div>
                </article>

                <aside className="sticky-aside" aria-labelledby="post-cta-heading">
                    <div className="cta-card surface-red">
                        <h2 id="post-cta-heading" className="title-3">{t('cta_heading')}</h2>
                        <p>{t('cta_desc')}</p>
                        <SmartLink href="/contact?type=repair" className="button button--block">
                            {t('cta_button')}
                        </SmartLink>
                        <p>
                            {t('cta_phone_prefix')}{' '}
                            <a href={TEL_HREF} className="text-link">{BUSINESS.phoneDisplay}</a>
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
