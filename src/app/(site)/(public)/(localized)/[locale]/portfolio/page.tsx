import React from 'react';
import type { Metadata } from 'next';
import Link from '@/shared/ui/Link';
import { getDB } from "@/db";
import { projects as projectsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import SmartLink from '@/shared/ui/SmartLink';
import ProjectCardImage from '@/features/landing/ProjectCardImage';
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = (await params) || { locale: 'en' };
    return pageMetadata({
        locale,
        path: '/portfolio',
        title: { key: 'portfolio_title' },
        description: { key: 'portfolio_description' },
    });
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = (await params) || { locale: 'en' } as any;
    const locale = resolvedParams.locale || 'en';
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const t = await getTranslations({ locale, namespace: 'portfolio_page' });

    const projects = db ? await db.query.projects.findMany({
        orderBy: [desc(projectsTable.completionDate)],
        with: {
            gallery: {
                with: {
                    media: true
                }
            },
            tags: true
        }
    }) : [];

    return (
        <div className="page">
            <section className="section section--snug" aria-labelledby="projects-title">
                <div className="wrap wrap--wide split split--center">
                    <div className="stack">
                        <p className="eyebrow">{t('badge')}</p>
                        <h1 id="projects-title" className="title-1">{t('heading')}</h1>
                        <p className="lead muted">{t('subheading')}</p>
                    </div>
                    <dl>
                        <div className="stat">
                            <dt>{t('total_deployments')}</dt>
                            <dd>
                                <span className="stat__value">1.2k+</span>
                                <span className="stat__note">{t('active_houston')}</span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            <section className="section surface-tint" aria-label={t('showing_count', { count: projects.length })}>
                <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-m)' } as React.CSSProperties}>
                    <p className="fine-print">{t('showing_count', { count: projects.length })}</p>

                    {projects.length === 0 ? (
                        <div className="card stack">
                            <p className="title-4">{t('no_projects')}</p>
                            <p className="muted">{t('check_back')}</p>
                        </div>
                    ) : (
                        <ul className="project-grid">
                            {projects.map((project) => {
                                const firstGalleryItem = project.gallery?.[0]?.media;
                                const imageUrl = firstGalleryItem?.url || null;

                                return (
                                    <li key={project.id}>
                                        <SmartLink href={`/portfolio/${project.slug}`} className="project-card">
                                            <div className="project-card__media">
                                                <ProjectCardImage
                                                    slug={project.slug || ''}
                                                    imageUrl={imageUrl}
                                                    title={project.title}
                                                    placeholderLabel={t('placeholder_image')}
                                                />
                                            </div>
                                            <div className="project-card__body">
                                                <div className="cluster" style={{ '--cluster-space': 'var(--space-2xs)' } as React.CSSProperties}>
                                                    <span className="eyebrow">{project.location || 'Houston, TX'}</span>
                                                    {project.client && <span className="chip">{project.client}</span>}
                                                </div>
                                                <h2 className="project-card__title">{project.title}</h2>
                                                {project.tags && project.tags.length > 0 && (
                                                    <ul className="badge-list">
                                                        {project.tags.map((tag: any, i: number) => (
                                                            <li key={i} className="chip">{tag.tag}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </SmartLink>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>

            <section className="section--snug surface-red" aria-labelledby="projects-cta">
                <div className="wrap wrap--wide stack">
                    <p className="eyebrow">{t('commercial_residential')}</p>
                    <h2 id="projects-cta" className="title-2">{t('cta_heading')}</h2>
                    <div className="cluster">
                        <Link href="/contact?type=contractor" className="button">
                            {t('cta_contractor')}
                        </Link>
                        <Link href="/contact" className="button button--secondary">
                            {t('cta_general')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
