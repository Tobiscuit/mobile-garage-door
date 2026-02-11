import React, { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <div className="flex flex-col min-h-screen bg-[#2c3e50] text-white font-work-sans overflow-x-hidden">
      <Header />
      
      {/* HERO / HEADER SECTION - Blueprint Style */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 bg-[#2c3e50] border-b border-white/10 overflow-hidden">
         {/* Technical Grid Background */}
         <div className="absolute inset-0 opacity-10" 
             style={{ 
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* Radial Glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f1c40f]/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#f1c40f] transition-colors mb-8 text-sm font-bold uppercase tracking-wider group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Projects
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-12 items-end">
              <div className="flex-grow">
                  <div className="inline-flex items-center gap-2 bg-[#f1c40f]/10 border border-[#f1c40f]/20 text-[#f1c40f] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-6">
                    Project Report
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none text-white">
                    {project.title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 md:gap-8 text-sm font-bold uppercase tracking-wider text-gray-400">
                    {project.client && (
                        <div className="flex items-center gap-2">
                           <span className="text-[#f1c40f]">Client:</span>
                           <span className="text-white">{project.client}</span>
                        </div>
                    )}
                    {project.location && (
                        <div className="flex items-center gap-2">
                           <span className="text-[#f1c40f]">Loc:</span>
                           <span className="text-white">{project.location}</span>
                        </div>
                    )}
                    {project.completionDate && (
                         <div className="flex items-center gap-2">
                            <span className="text-[#f1c40f]">Date:</span>
                            <span className="text-white">{new Date(project.completionDate).toLocaleDateString()}</span>
                         </div>
                    )}
                  </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-w-md justify-end">
                      {project.tags.map((t: any, i: number) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/20 px-2 py-1 rounded bg-white/5">
                              {t.tag}
                          </span>
                      ))}
                  </div>
              )}
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-7xl">
        
        {/* MAIN IMAGE */}
        <div className="mb-20 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-[#15202b]">
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
                   <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c3e50] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <span className="text-white/10 font-black text-6xl uppercase tracking-tighter relative z-10">Mobil</span>
                        <div className="mt-4 px-3 py-1 border border-white/10 rounded text-[10px] font-mono text-white/30">IMG_MISSING_001</div>
                   </div>
               )}
            </div>
            
            {/* Overlay Badge */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20 font-bold flex items-center gap-3 text-sm md:text-base">
               <span className="w-2 h-2 bg-[#f1c40f] rounded-full animate-pulse"></span>
               System Deployed
            </div>
        </div>

        {/* BIFURCATED CHALLENGE / SOLUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {/* Challenge */}
          <div className="bg-[#2c3e50] p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-white group-hover:opacity-10 transition-opacity">
               <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="text-red-500 font-mono text-lg">01.</span>
              The Challenge
            </h2>
            <div className="relative z-10 text-gray-300 leading-relaxed">
               {challengeContent ? (
                  <SerializeLexical nodes={challengeContent} />
               ) : (
                  <p className="text-gray-500 italic">No specific challenge details documented.</p>
               )}
            </div>
          </div>

          {/* Solution */}
          <div className="bg-[#2c3e50] p-8 md:p-10 rounded-3xl border border-[#f1c40f]/20 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.2)]">
             <div className="absolute top-0 right-0 p-6 opacity-5 text-[#f1c40f] group-hover:opacity-10 transition-opacity">
               <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-3 border-b border-[#f1c40f]/20 pb-4">
              <span className="text-[#f1c40f] font-mono text-lg">02.</span>
              The Solution
            </h2>
            <div className="relative z-10 text-gray-300 leading-relaxed">
               {solutionContent ? (
                  <SerializeLexical nodes={solutionContent} />
               ) : (
                  <p className="text-gray-500 italic">No solution details documented.</p>
               )}
            </div>
          </div>
        </div>

        {/* STATS / METRICS (If any) */}
        {project.stats && project.stats.length > 0 && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {project.stats.map((stat, idx) => (
                 <div key={idx} className="bg-[#1e2b38] p-6 rounded-2xl border border-white/5 text-center group hover:border-[#f1c40f]/30 transition-colors">
                    <div className="text-3xl font-black text-white mb-2 group-hover:text-[#f1c40f] transition-colors">{stat.value}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                 </div>
              ))}
           </div>
        )}

        {/* FULL CASE STUDY (Description) */}
        {descriptionContent && (
           <div className="max-w-4xl mx-auto bg-[#1e2b38] p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
              <div className="relative z-10">
                  <h3 className="text-[#f1c40f] font-bold uppercase tracking-widest text-xs mb-8 border-b border-white/10 pb-4 inline-block">
                     Technical Breakdown
                  </h3>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                     <SerializeLexical nodes={descriptionContent} />
                  </div>
              </div>
           </div>
        )}

      </main>

      {/* CTA */}
      <section className="bg-[#f1c40f] text-[#2c3e50] py-24 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to upgrade your infrastructure?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-bold opacity-80">
               Mobil Garage Door delivers industrial-grade security and performance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/contact?type=contractor" className="bg-[#2c3e50] text-white font-bold py-4 px-10 rounded-xl hover:bg-black transition-all shadow-2xl hover:scale-105">
                   Contractor Portal
                </Link>
                <Link href="/contact" className="bg-transparent border-2 border-[#2c3e50] text-[#2c3e50] font-bold py-4 px-10 rounded-xl hover:bg-[#2c3e50] hover:text-white transition-all">
                   General Inquiry
                </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}