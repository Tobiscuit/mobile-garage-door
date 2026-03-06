import React, { Fragment } from 'react';
import Link from '@/shared/ui/Link';
import { notFound } from 'next/navigation';
import { getDB } from "@/db";
import { projects as projectsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import SmartLink from '@/shared/ui/SmartLink';
import ProjectHeroImage from '@/features/landing/ProjectHeroImage';
import { getTranslations } from '@/lib/server-translations';
import { getCloudflareContext } from "@/lib/cloudflare";

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
          if (node.format & 1) text = <strong key={i} className="font-bold">{text}</strong>;
          if (node.format & 2) text = <em key={i} className="italic">{text}</em>;
          if (node.format & 8) text = <u key={i} className="underline">{text}</u>;
          return text;
        }

        const serializedChildren = node.children ? <SerializeLexical nodes={node.children} /> : null;

        switch (node.type) {
          case 'root':
            return <div key={i}>{serializedChildren}</div>;
          case 'heading':
            const Tag = (node.tag || 'h2') as any;
            const sizes = {
              h1: 'text-4xl md:text-5xl',
              h2: 'text-3xl md:text-4xl',
              h3: 'text-2xl md:text-3xl',
              h4: 'text-xl md:text-2xl',
              h5: 'text-lg md:text-xl',
              h6: 'text-base md:text-lg',
            };
            return (
              <Tag key={i} className={`${sizes[node.tag as keyof typeof sizes] || 'text-2xl'} font-bold mb-4 mt-6 first:mt-0`}>
                {serializedChildren}
              </Tag>
            );
          case 'paragraph':
            return (
              <p key={i} className="mb-4 leading-relaxed last:mb-0">
                {serializedChildren}
              </p>
            );
          case 'list':
            const ListTag = node.listType === 'number' ? 'ol' : 'ul';
            return (
              <ListTag key={i} className={`mb-6 ${node.listType === 'number' ? 'list-decimal' : 'list-disc'} list-inside pl-4`}>
                {serializedChildren}
              </ListTag>
            );
          case 'listitem':
            return <li key={i} className="mb-2">{serializedChildren}</li>;
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-golden-yellow pl-4 italic text-slate-500 my-6">
                {serializedChildren}
              </blockquote>
            );
          case 'link':
            return (
              <a key={i} href={node.fields?.url} target={node.fields?.newTab ? '_blank' : undefined} className="text-golden-yellow hover:underline transition-colors">
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

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id: slug, locale } = await params;
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  if (!db) return notFound();

  const t = await getTranslations({ locale, namespace: 'portfolio_detail' });

  const project = await db.query.projects.findFirst({
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

  if (!project) {
    return notFound();
  }

  const imageUrl = project.gallery?.[0]?.media?.url || null;

  return (
    <div className="flex flex-col min-h-screen bg-cloudy-white text-charcoal-blue font-work-sans overflow-x-hidden">

      {/* HEADER SECTION - Matches Home Page "Contractor" Side */}
      <section className="relative pt-32 pb-12 px-6 md:px-12 bg-cloudy-white border-b border-gray-200 overflow-hidden">
        {/* Dot Grid Pattern (Matches Hero) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#bdc3c7 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <SmartLink href="/portfolio" className="inline-flex items-center gap-2 text-steel-gray hover:text-charcoal-blue transition-colors mb-8 text-sm font-bold uppercase tracking-wider group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('back')}
          </SmartLink>

          <div className="flex flex-col lg:flex-row gap-12 items-end">
            <div className="flex-grow">
              <div className="inline-flex items-center gap-2 bg-golden-yellow/10 border border-golden-yellow/40 text-charcoal-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <svg className="w-3 h-3 text-golden-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                {t('badge')}
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none text-charcoal-blue">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-6 md:gap-12 text-sm font-bold uppercase tracking-wider text-steel-gray">
                {project.client && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 mb-1">{t('client_label')}</span>
                    <span className="text-charcoal-blue border-l-2 border-golden-yellow pl-3">{project.client}</span>
                  </div>
                )}
                {project.location && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 mb-1">{t('location_label')}</span>
                    <span className="text-charcoal-blue border-l-2 border-golden-yellow pl-3">{project.location}</span>
                  </div>
                )}
                {project.completionDate && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 mb-1">{t('completion_label')}</span>
                    <span className="text-charcoal-blue border-l-2 border-golden-yellow pl-3">{new Date(project.completionDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-md justify-end">
                {project.tags.map((t: any, i: number) => (
                  <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-charcoal-blue bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-full">
                    {t.tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">

        {/* MAIN IMAGE - Industrial Frame */}
        <div className="mb-20 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-200 group bg-charcoal-blue">
          <ProjectHeroImage
            slug={project.slug || ''}
            imageUrl={imageUrl}
            title={project.title}
          />

          {/* Overlay Gradient (Subtle) */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        {/* BIFURCATED CHALLENGE / SOLUTION - Echoing Home Page Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-20 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          {/* Challenge - Dark Side (Echoes "Something Broken?") */}
          <div className="bg-charcoal-blue p-10 md:p-16 relative overflow-hidden group text-white">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative z-10">
              <div className="inline-block bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-6">
                {t('challenge_badge')}
              </div>
              <h2 className="text-3xl font-black mb-6 leading-tight">
                {t('challenge_heading')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{t('challenge_accent')}</span>
              </h2>
              <div className="prose prose-invert prose-lg text-gray-300">
                {project.htmlChallenge ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlChallenge }} />
                ) : project.challenge ? (
                  <SerializeLexical nodes={project.challenge} />
                ) : (
                  <p className="text-gray-500 italic">{t('no_challenge')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Solution - Light Side (Echoes "Something New?") */}
          <div className="bg-white p-10 md:p-16 relative overflow-hidden group text-charcoal-blue">
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative z-10">
              <div className="inline-block bg-golden-yellow/20 text-yellow-700 border border-golden-yellow/40 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-6">
                {t('solution_badge')}
              </div>
              <h2 className="text-3xl font-black mb-6 leading-tight">
                {t('solution_heading')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-golden-yellow">{t('solution_accent')}</span>
              </h2>
              <div className="prose prose-lg text-gray-600">
                {project.htmlSolution ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlSolution }} />
                ) : project.solution ? (
                  <SerializeLexical nodes={project.solution} />
                ) : (
                  <p className="text-gray-400 italic">{t('no_solution')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STATS / METRICS (If any) */}
        {project.stats && project.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {project.stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg text-center group hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black text-charcoal-blue mb-2">{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* FULL CASE STUDY (Description) */}
        {project.description && (
          <div className="max-w-5xl mx-auto mb-24">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-charcoal-blue via-golden-yellow to-charcoal-blue"></div>

              <h3 className="text-charcoal-blue font-black text-3xl uppercase tracking-tight mb-8 flex items-center gap-4">
                <span className="w-12 h-2 bg-golden-yellow"></span>
                {t('breakdown_heading')}
              </h3>

              <div className="prose prose-lg max-w-none text-gray-600 prose-headings:font-black prose-headings:text-charcoal-blue prose-strong:text-charcoal-blue prose-li:marker:text-golden-yellow">
                {project.htmlDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: project.htmlDescription }} />
                ) : (
                  <SerializeLexical nodes={project.description} />
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CTA */}
      <section className="bg-charcoal-blue text-white py-24 text-center relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6">{t('cta_heading')}</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-400">
            {t('cta_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact?type=contractor" className="bg-golden-yellow text-charcoal-blue font-bold py-4 px-10 rounded-xl hover:bg-white transition-all shadow-lg hover:scale-105">
              {t('cta_contractor')}
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-white/20 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-all">
              {t('cta_general')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
