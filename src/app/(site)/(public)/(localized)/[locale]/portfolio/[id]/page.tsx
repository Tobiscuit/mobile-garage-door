import React, { Fragment } from 'react';
import type { Metadata } from 'next';
import Link from '@/shared/ui/Link';
import { notFound } from 'next/navigation';
import { getDB } from "@/db";
import { projects as projectsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import SmartLink from '@/shared/ui/SmartLink';
import ProjectHeroImage from '@/features/landing/ProjectHeroImage';
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";
import { pageMetadata } from '@/lib/seo/metadata';
import { projectPath } from '@/lib/seo/site';
import { excerpt, plainText } from '@/lib/seo/text';
import { formatDate, isoDate } from '@/lib/seo/dates';

export const dynamic = 'force-dynamic';

// --- Lexical Serializer ---
const SerializeLexical = ({ nodes }: { nodes: any[] | string }) => {
  if (!nodes) return null;

  let parsedNodes: any[];
  if (typeof nodes === 'string') {
    try {
      const data = JSON.parse(nodes);
      parsedNodes = data.root?.children || [];
    } catch (e) {
      return <span>{nodes}</span>;
    }
  } else {
    parsedNodes = nodes;
  }

  if (!Array.isArray(parsedNodes)) return null;

  return (
    <>
      {parsedNodes.map((node, i) => {
        if (!node) return null;

        if (node.type === 'text') {
          let text = <span key={i}>{node.text}</span>;
          if (node.format & 1) text = <strong key={i}>{text}</strong>;
          if (node.format & 2) text = <em key={i}>{text}</em>;
          if (node.format & 8) text = <u key={i}>{text}</u>;
          return text;
        }

        const serializedChildren = node.children ? <SerializeLexical nodes={node.children} /> : null;

        switch (node.type) {
          case 'root':
            return <div key={i}>{serializedChildren}</div>;
          case 'heading':
            // Authored headings sit under the page's h2 sections, so h1/h2 render one level down.
            const Tag = (node.tag === 'h1' || node.tag === 'h2' ? 'h3' : node.tag || 'h3') as any;
            return <Tag key={i}>{serializedChildren}</Tag>;
          case 'paragraph':
            return <p key={i}>{serializedChildren}</p>;
          case 'list':
            const ListTag = node.listType === 'number' ? 'ol' : 'ul';
            return <ListTag key={i}>{serializedChildren}</ListTag>;
          case 'listitem':
            return <li key={i}>{serializedChildren}</li>;
          case 'quote':
            return <blockquote key={i}>{serializedChildren}</blockquote>;
          case 'link':
            return (
              <a key={i} href={node.fields?.url} target={node.fields?.newTab ? '_blank' : undefined}>
                {serializedChildren}
              </a>
            );
          default:
            return <Fragment key={i}>{serializedChildren}</Fragment>;
        }
      })}
    </>
  );
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

async function loadProject(slug: string) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  if (!db) return null;
  return db.query.projects.findFirst({
    where: eq(projectsTable.slug, slug),
    with: {
      gallery: {
        with: {
          media: true
        }
      },
      tags: true,
      stats: true
    }
  });
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id: slug, locale } = await params;
  const project = await loadProject(slug);
  if (!project) {
    return pageMetadata({ locale, path: '/portfolio', title: { key: 'portfolio_title' }, description: { key: 'portfolio_description' }, noindex: true });
  }
  const summary = excerpt(plainText(project.htmlDescription || project.description || project.htmlSolution || project.solution));
  const media = project.gallery?.[0]?.media;
  return pageMetadata({
    locale,
    path: projectPath(project.slug),
    title: { key: 'project_title', values: { title: project.title } },
    description: summary ? { text: summary } : { key: 'project_description', values: { title: project.title } },
    image: media?.url
      ? { url: media.url, width: media.width ?? undefined, height: media.height ?? undefined, alt: media.alt || project.title }
      : undefined,
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id: slug, locale } = await params;
  // loadProject returns null without a database, as the page's notFound() guard did before.
  const project = await loadProject(slug);
  if (!project) {
    return notFound();
  }

  const t = await getTranslations({ locale, namespace: 'portfolio_detail' });

  const imageUrl = project.gallery?.[0]?.media?.url || null;

  return (
    <div className="page">
      <section className="section section--snug" aria-labelledby="project-title">
        <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-m)' } as React.CSSProperties}>
          <SmartLink href="/portfolio" className="text-link">
            <span aria-hidden="true">← </span>{t('back')}
          </SmartLink>

          <div className="stack" style={{ '--stack-space': 'var(--space-s)' } as React.CSSProperties}>
            <p className="eyebrow">{t('badge')}</p>
            <h1 id="project-title" className="title-1">{project.title}</h1>

            <dl className="detail-meta">
              {project.client && (
                <div>
                  <dt>{t('client_label')}</dt>
                  <dd>{project.client}</dd>
                </div>
              )}
              {project.location && (
                <div>
                  <dt>{t('location_label')}</dt>
                  <dd>{project.location}</dd>
                </div>
              )}
              {project.completionDate && (
                <div>
                  <dt>{t('completion_label')}</dt>
                  <dd><time dateTime={isoDate(project.completionDate)}>{formatDate(project.completionDate, locale)}</time></dd>
                </div>
              )}
            </dl>

            {project.tags && project.tags.length > 0 && (
              <ul className="badge-list">
                {project.tags.map((tag: any, i: number) => (
                  <li key={i} className="chip">{tag.tag}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="media-frame">
            <ProjectHeroImage
              slug={project.slug || ''}
              imageUrl={imageUrl}
              title={project.title}
              placeholderLabel={t('placeholder_image')}
            />
          </div>
        </div>
      </section>

      <section className="section surface-tint" aria-label={t('badge')}>
        <div className="wrap wrap--wide stack" style={{ '--stack-space': 'var(--space-l)' } as React.CSSProperties}>
          <div className="panel-grid">
            <section className="panel surface-red stack" aria-labelledby="challenge-heading">
              <h2 id="challenge-heading" className="title-3">{t('challenge_heading')}</h2>
              <div className="rich-text">
                {project.htmlChallenge ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlChallenge }} />
                ) : project.challenge ? (
                  <SerializeLexical nodes={project.challenge} />
                ) : (
                  <p>{t('no_challenge')}</p>
                )}
              </div>
            </section>

            <section className="panel surface-light stack" aria-labelledby="solution-heading">
              <h2 id="solution-heading" className="title-3">{t('solution_heading')}</h2>
              <div className="rich-text">
                {project.htmlSolution ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlSolution }} />
                ) : project.solution ? (
                  <SerializeLexical nodes={project.solution} />
                ) : (
                  <p className="muted">{t('no_solution')}</p>
                )}
              </div>
            </section>
          </div>

          {project.stats && project.stats.length > 0 && (
            <section className="stack" aria-labelledby="project-stats-heading">
              <h2 id="project-stats-heading" className="title-3">{t('stats_heading')}</h2>
              <dl className="stat-grid">
                {project.stats.map((stat, idx) => (
                  <div key={idx} className="stat">
                    <dt>{stat.label}</dt>
                    <dd><span className="stat__value">{stat.value}</span></dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {project.description && (
            <section className="card stack" aria-labelledby="breakdown-heading">
              <h2 id="breakdown-heading" className="title-3">{t('breakdown_heading')}</h2>
              <div className="rich-text">
                {project.htmlDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlDescription }} />
                ) : (
                  <SerializeLexical nodes={project.description} />
                )}
              </div>
            </section>
          )}
        </div>
      </section>

      <section className="section--snug surface-red" aria-labelledby="project-cta">
        <div className="wrap wrap--wide stack">
          <h2 id="project-cta" className="title-2">{t('cta_heading')}</h2>
          <p className="lead">{t('cta_subtitle')}</p>
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
