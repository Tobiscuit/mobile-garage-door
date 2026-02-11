import React, { Fragment } from 'react';
import Link from 'next/link';
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
            const Tag = (node.tag || 'h2') as keyof JSX.IntrinsicElements;
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

  // Helper to extract background style or image
  // Assuming imageStyle maps to CSS classes defined elsewhere or we use inline styles for now?
  // The original code used classes like 'garage-pattern-modern'. 
  // If these are Tailwind classes or custom CSS, we preserve them.
  // If 'image' (media) is present, we should use that as a background or img tag.
  
  const bgStyle = project.imageStyle || 'garage-pattern-modern';
  
  // Safe extraction of RichText content
  const challengeContent = (project.challenge as any)?.root?.children;
  const solutionContent = (project.solution as any)?.root?.children;
  const descriptionContent = (project.description as any)?.root?.children;

  return (
    <div className="flex flex-col min-h-screen bg-[#1e2b38] text-white font-display overflow-x-hidden">
      <Header />
      
      {/* HERO / HEADER SECTION */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 bg-[#15202b] border-b border-white/5">
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-gray-400 hover:text-golden-yellow transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Projects
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            {project.title}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-mono text-gray-400 mb-8">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
               {project.client}
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-400"></span>
               {project.location}
            </div>
            {project.completionDate && (
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    {new Date(project.completionDate).toLocaleDateString()}
                 </div>
            )}
          </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-7xl">
        
        {/* BIFURCATED CHALLENGE / SOLUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {/* Challenge */}
          <div className="bg-[#white]/5 bg-[#2c3e50]/40 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-red-500 group-hover:opacity-20 transition-opacity">
               <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              The Challenge
            </h2>
            <div className="relative z-10">
               {challengeContent ? (
                  <SerializeLexical nodes={challengeContent} />
               ) : (
                  <p className="text-gray-400 italic">No challenge details provided.</p>
               )}
            </div>
          </div>

          {/* Solution */}
          <div className="bg-[#white]/5 bg-[#2c3e50]/40 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-golden-yellow/30 transition-all duration-500">
             <div className="absolute top-0 right-0 p-6 opacity-10 text-golden-yellow group-hover:opacity-20 transition-opacity">
               <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-golden-yellow mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-golden-yellow rounded-full shadow-[0_0_10px_#f1c40f]"></span>
              The Solution
            </h2>
            <div className="relative z-10">
               {solutionContent ? (
                  <SerializeLexical nodes={solutionContent} />
               ) : (
                  <p className="text-gray-400 italic">No solution details provided.</p>
               )}
            </div>
          </div>
        </div>

        {/* VISUALS / BEFORE & AFTER */}
        <div className="mb-20">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                {/* Fallback pattern or Image */}
                <div className={`w-full aspect-video ${bgStyle} bg-cover bg-center transition-transform duration-700 group-hover:scale-105`}>
                   {/* If we had a real image URL, we'd use <Image /> here */}
                </div>
                
                {/* Overlay Badge */}
                <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur text-white px-6 py-3 rounded-full border border-white/20 font-bold flex items-center gap-3">
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                   Project Complete
                </div>
            </div>
        </div>

        {/* STATS / METRICS (If any) */}
        {project.stats && project.stats.length > 0 && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {project.stats.map((stat, idx) => (
                 <div key={idx} className="bg-[#15202b] p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                 </div>
              ))}
           </div>
        )}

        {/* FULL CASE STUDY (Description) */}
        {/* Only show if it differs from challenge/solution or if specifically populated with extra info */}
        {descriptionContent && (
           <div className="max-w-4xl mx-auto bg-[#2c3e50]/20 p-8 md:p-12 rounded-3xl border border-white/5">
              <h3 className="text-golden-yellow font-bold uppercase tracking-widest text-xs mb-8 border-b border-white/10 pb-4">
                 Full Case Study & Benefits
              </h3>
              <div className="prose prose-invert prose-lg max-w-none">
                 <SerializeLexical nodes={descriptionContent} />
              </div>
           </div>
        )}

      </main>

      {/* CTA */}
      <section className="bg-golden-yellow text-charcoal-blue py-20 text-center">
         <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Need results like this?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-medium opacity-90">
               We handle the complex projects that other contractors walk away from.
            </p>
            <Link href="/contact" className="inline-block bg-charcoal-blue text-white font-bold py-4 px-10 rounded-xl hover:bg-black transition-all shadow-xl transform hover:-translate-y-1">
               Start Your Project
            </Link>
         </div>
      </section>

      <Footer />
    </div>
  );
}
