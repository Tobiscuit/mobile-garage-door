import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import SmartLink from '@/components/SmartLink';
import ProjectCardImage from '@/components/ProjectCardImage';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const payload = await getPayload({ config: configPromise });
  const { docs: projects } = await payload.find({
    collection: 'projects',
    sort: '-completionDate', // Newest completions first
    depth: 2,
  });

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans text-charcoal-blue flex flex-col">
      <main className="flex-grow">
        
        {/* HERO: Contractor Focused - Industrial/Premium (Blueprint Style) */}
        <section className="bg-[#2c3e50] pt-32 pb-24 px-6 relative overflow-hidden border-b border-white/10">
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ 
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                 }}>
            </div>
            
            {/* Radial Glow for Depth */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f1c40f]/10 to-transparent pointer-events-none"></div>

            <div className="container mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-[#f1c40f]/10 border border-[#f1c40f]/20 text-[#f1c40f] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
                            <span className="w-2 h-2 rounded-full bg-[#f1c40f] animate-pulse"></span>
                            Project Catalog
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-none mb-8 tracking-tight text-white">
                            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f1c40f] to-white">Performance.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-medium">
                            A showcase of technical installations, custom fabrications, and rapid response deployments across Texas.
                        </p>
                    </div>
                    
                    {/* Stat Box - Glassmorphism */}
                     <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 transform rotate-1 hidden lg:block min-w-[280px] shadow-2xl">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Total Deployments</div>
                        <div className="text-6xl font-black text-white leading-none mb-1">1.2k<span className="text-[#f1c40f] text-4xl">+</span></div>
                        <div className="text-xs text-[#f1c40f] font-bold tracking-wider opacity-80">ACTIVE IN HOUSTON METRO</div>
                     </div>
                </div>
            </div>
        </section>

        {/* PROJECTS GRID */}
        <section className="py-24 px-6 bg-[#f8f9fa]">
            <div className="container mx-auto">
                
                {/* Filter/Status Bar */}
                <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
                    <div className="text-sm font-bold text-[#2c3e50] uppercase tracking-widest">
                        Showing <span className="text-[#f1c40f]">{projects.length}</span> Verified Installs
                    </div>
                    <div className="hidden md:flex gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort By:</span>
                        <span className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest cursor-pointer hover:text-[#f1c40f] transition-colors">Date (Newest)</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">|</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#2c3e50] transition-colors">Scale</span>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl">
                        <h3 className="text-2xl font-bold text-gray-400">No projects published yet.</h3>
                        <p className="text-gray-400 mt-2">Check back soon for case studies.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {projects.map((project, index) => {
                            // Robust Image Handling
                            const imageUrl = typeof project.image === 'object' && project.image?.url 
                                ? project.image.url 
                                : null;
                            
                            return (
                                <SmartLink 
                                    href={`/portfolio/${project.slug}`} 
                                    key={project.id}
                                    className="group relative block w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white"
                                >
                                    {/* IMAGE LAYER */}
                                    <ProjectCardImage 
                                      slug={project.slug || ''} 
                                      imageUrl={imageUrl} 
                                      title={project.title} 
                                    />

                                    {/* OVERLAY GRADIENT */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50] via-[#2c3e50]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                                    {/* CONTENT LAYER */}
                                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                                        
                                        {/* TOP BADGES */}
                                        <div className="flex justify-end items-start w-full">
                                            {project.client && (
                                                <span className="bg-[#f1c40f] text-[#2c3e50] text-[10px] md:text-xs font-black uppercase tracking-wider px-2 py-1 md:px-3 md:py-1.5 rounded shadow-lg">
                                                    {project.client}
                                                </span>
                                            )}
                                        </div>

                                        {/* TEXT CONTENT */}
                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 mt-auto pt-4 md:pt-12">
                                            <div className="flex items-center gap-2 text-[#f1c40f] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-3">
                                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {project.location || 'Houston, TX'}
                                            </div>
                                            
                                            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2 md:mb-4 group-hover:text-[#f1c40f] transition-colors [text-wrap:balance]">
                                                {project.title}
                                            </h2>

                                            {/* TAGS */}
                                            {project.tags && project.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                    {project.tags.map((t: any, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/20 px-2 py-1 rounded hover:bg-white/10">
                                                            {t.tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SmartLink>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>

        {/* CALL TO ACTION: Contractor Focused */}
        <section className="bg-[#2c3e50] py-20 border-t border-white/10 relative overflow-hidden">
             {/* Background Texture */}
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
            
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="inline-block bg-[#f1c40f]/20 text-[#f1c40f] font-bold px-4 py-2 rounded-full mb-6 border border-[#f1c40f]/30 text-xs uppercase tracking-wider">
                    Commercial & Residential
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
                    Need a spec sheet or <br/><span className="text-[#f1c40f]">custom quote?</span>
                </h2>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <Link href="/contact?type=contractor" className="bg-[#f1c40f] hover:bg-yellow-400 text-[#2c3e50] font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Access Contractor Portal
                    </Link>
                    <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition-all border border-white/10">
                        General Inquiry
                    </Link>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
