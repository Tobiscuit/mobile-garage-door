import React, { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// --- Lexical Serializer ---
// Basic renderer for Lexical RichText nodes
const SerializeLexical = ({ nodes }: { nodes: any[] }) => {
  if (!nodes || !Array.isArray(nodes)) return null;

  return (
    <>
      {nodes.map((node, i) => {
        if (!node) return null;

        if (node.type === 'text') {
          let text = <span key={i}>{node.text}</span>;
          // Bitwise checks for Lexical formats: 1=Bold, 2=Italic, 8=Underline, etc.
          if (node.format & 1) text = <strong key={i} className="font-bold text-white">{text}</strong>;
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
              <Tag key={i} className={`${sizes[node.tag as keyof typeof sizes] || 'text-2xl'} font-bold mb-4 text-golden-yellow mt-6 first:mt-0`}>
                {serializedChildren}
              </Tag>
            );
          case 'paragraph':
            return (
              <p key={i} className="mb-4 leading-relaxed text-gray-300 last:mb-0">
                {serializedChildren}
              </p>
            );
          case 'list':
            const ListTag = node.listType === 'number' ? 'ol' : 'ul';
            return (
              <ListTag key={i} className={`mb-6 ${node.listType === 'number' ? 'list-decimal' : 'list-disc'} list-inside text-gray-300 pl-4`}>
                {serializedChildren}
              </ListTag>
            );
          case 'listitem':
            return <li key={i} className="mb-2">{serializedChildren}</li>;
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-golden-yellow pl-4 italic text-gray-400 my-6">
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
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const projects = await payload.find({
    collection: 'projects',
    limit: 100,
    depth: 0,
  });

  return projects.docs.map((project) => ({
    id: project.slug,
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id: slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'projects',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 1, // Fetch relationships/media if needed
  });

  const project = result.docs[0];

  if (!project) {
    return notFound();
  }

  // Robust Image Handling
  const imageUrl = typeof project.image === 'object' && project.image?.url 
      ? project.image.url 
      : null;
  
  // Safe extraction of RichText content
  const challengeContent = (project.challenge as any)?.root?.children;
  const solutionContent = (project.solution as any)?.root?.children;
  const descriptionContent = (project.description as any)?.root?.children;

  return (
    <div className="flex flex-col min-h-screen bg-cloudy-white text-charcoal-blue font-work-sans overflow-x-hidden">
      
      {/* HEADER SECTION - Matches Home Page "Contractor" Side */}
      <section className="relative pt-32 pb-12 px-6 md:px-12 bg-cloudy-white border-b border-gray-200 overflow-hidden">
         {/* Dot Grid Pattern (Matches Hero) */}
         <div className="absolute inset-0 opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#bdc3c7 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-steel-gray hover:text-charcoal-blue transition-colors mb-8 text-sm font-bold uppercase tracking-wider group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Projects
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-12 items-end">
              <div className="flex-grow">
                  <div className="inline-flex items-center gap-2 bg-golden-yellow/10 border border-golden-yellow/40 text-charcoal-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                    <svg className="w-3 h-3 text-golden-yellow" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    Project Report
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none text-charcoal-blue">
                    {project.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-6 md:gap-12 text-sm font-bold uppercase tracking-wider text-steel-gray">
                    {project.client && (
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-400 mb-1">Client</span>
                           <span className="text-charcoal-blue border-l-2 border-golden-yellow pl-3">{project.client}</span>
                        </div>
                    )}
                    {project.location && (
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-400 mb-1">Location</span>
                           <span className="text-charcoal-blue border-l-2 border-golden-yellow pl-3">{project.location}</span>
                        </div>
                    )}
                    {project.completionDate && (
                         <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 mb-1">Completion</span>
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
            <div className="w-full aspect-video relative">
               {imageUrl ? (
                   <Image 
                       src={imageUrl} 
                       alt={project.title} 
                       fill 
                       className="object-cover"
                       priority
                   />
               ) : (
                   /* BLUEPRINT FALLBACK - Matching Brand Aesthetics */
                   <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c3e50] relative overflow-hidden">
                        {/* Blueprint Grid */}
                        <div className="absolute inset-0 opacity-20" 
                             style={{ 
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', 
                                backgroundSize: '40px 40px' 
                             }}>
                        </div>
                        <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none"></div>
                        
                        {/* Technical Markers */}
                        <div className="absolute top-8 left-8 text-white/40 font-mono text-xs">REF: {project.slug?.toUpperCase()}</div>
                        <div className="absolute bottom-8 right-8 text-white/40 font-mono text-xs">SCALE: 1:1</div>
                        
                        {/* Center Logo */}
                        <div className="text-center z-10 opacity-50">
                            <div className="text-6xl text-white mb-4"><svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                            <span className="text-white font-black text-4xl uppercase tracking-tighter block">Image Pending</span>
                            <span className="text-golden-yellow font-mono text-sm mt-2 block">AWAITING_UPLOAD</span>
                        </div>
                   </div>
               )}
            </div>
            
            {/* Overlay Badge */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur text-charcoal-blue px-5 py-2 rounded-lg border border-gray-200 font-bold flex items-center gap-3 text-sm shadow-lg">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               System Verified
            </div>
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
                    The Challenge
                </div>
                <h2 className="text-3xl font-black mb-6 leading-tight">
                    Identifying the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Critical Failure.</span>
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300">
                   {challengeContent ? (
                      <SerializeLexical nodes={challengeContent} />
                   ) : (
                      <p className="text-gray-500 italic">No specific challenge details documented.</p>
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
                    The Solution
                </div>
                <h2 className="text-3xl font-black mb-6 leading-tight">
                    Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-golden-yellow">Longevity.</span>
                </h2>
                <div className="prose prose-lg text-gray-600">
                   {solutionContent ? (
                      <SerializeLexical nodes={solutionContent} />
                   ) : (
                      <p className="text-gray-400 italic">No solution details documented.</p>
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
        {descriptionContent && (
           <div className="max-w-4xl mx-auto">
              <h3 className="text-charcoal-blue font-black text-2xl uppercase tracking-tight mb-8 flex items-center gap-4">
                 <span className="w-8 h-1 bg-golden-yellow"></span>
                 Technical Breakdown
              </h3>
              <div className="prose prose-lg max-w-none text-gray-600">
                 <SerializeLexical nodes={descriptionContent} />
              </div>
           </div>
        )}

      </main>

      {/* CTA */}
      <section className="bg-charcoal-blue text-white py-24 text-center relative overflow-hidden border-t border-white/10">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to upgrade your infrastructure?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-400">
               Mobil Garage Door delivers industrial-grade security and performance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/contact?type=contractor" className="bg-golden-yellow text-charcoal-blue font-bold py-4 px-10 rounded-xl hover:bg-white transition-all shadow-lg hover:scale-105">
                   Contractor Portal
                </Link>
                <Link href="/contact" className="bg-transparent border-2 border-white/20 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-all">
                   General Inquiry
                </Link>
            </div>
         </div>
      </section>
    </div>
  );
}