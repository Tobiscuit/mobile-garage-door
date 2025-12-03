import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />

        {/* System Capabilities Section */}
        <section className="container mx-auto px-6 py-24 relative z-10">
           <div className="flex items-center gap-4 mb-12">
             <div className="h-px bg-white/10 flex-grow"></div>
             <h3 className="text-brand-yellow font-mono text-sm tracking-widest uppercase">System Capabilities</h3>
             <div className="h-px bg-white/10 flex-grow"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Card 1 */}
             <div className="card-forge p-8 border border-white/5 hover:border-brand-yellow/30 transition-all group">
               <div className="w-12 h-12 bg-charcoal-deep rounded-lg flex items-center justify-center mb-6 text-tech-cyan group-hover:scale-110 transition-transform shadow-neon">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </div>
               <h4 className="text-xl font-bold text-white mb-3 font-outfit">Precision Search</h4>
               <p className="text-steel-gray text-sm leading-relaxed">
                 Query the universal database with sub-millisecond latency. Filter by material, mechanism, and thermal efficiency ratings.
               </p>
             </div>

             {/* Card 2 */}
             <div className="card-forge p-8 border border-white/5 hover:border-brand-yellow/30 transition-all group">
               <div className="w-12 h-12 bg-charcoal-deep rounded-lg flex items-center justify-center mb-6 text-brand-yellow group-hover:scale-110 transition-transform shadow-neon">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
               </div>
               <h4 className="text-xl font-bold text-white mb-3 font-outfit">Instant-View™</h4>
               <p className="text-steel-gray text-sm leading-relaxed">
                 Visualize garage door configurations in real-time using our proprietary WebGPU rendering engine.
               </p>
             </div>

             {/* Card 3 */}
             <div className="card-forge p-8 border border-white/5 hover:border-brand-yellow/30 transition-all group">
               <div className="w-12 h-12 bg-charcoal-deep rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform shadow-neon">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <h4 className="text-xl font-bold text-white mb-3 font-outfit">Smart Integration</h4>
               <p className="text-steel-gray text-sm leading-relaxed">
                 API endpoints available for seamless integration with home automation systems (Nano Banana 2 Compatible).
               </p>
             </div>
           </div>
        </section>

        {/* Decorative Grid Background */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      </main>
      <Footer />
    </div>
  );
}
