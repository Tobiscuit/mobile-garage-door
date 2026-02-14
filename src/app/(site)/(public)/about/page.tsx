import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPayloadClient } from '@/lib/payload';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  });

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans">
      <Header />
      <main className="flex-grow">
        
        {/* HERO: Blueprint Style */}
        <section className="bg-charcoal-blue text-white pt-48 pb-24 relative overflow-hidden min-h-[50vh] flex flex-col justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-golden-yellow px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        Since 2014
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
                        We don't sell doors. <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-golden-yellow to-white">
                            We sell Security.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                        {settings.missionStatement || "Founded on the principle that a garage door is the primary moving part of your home's security envelope. We engineer reliability into every install."}
                    </p>
                </div>
            </div>
        </section>

        {/* STATS BAR */}
        <div className="bg-golden-yellow py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     {settings.stats?.map((stat: any, index: number) => (
                        <div key={index} className="text-center md:text-left border-r last:border-0 border-charcoal-blue/10">
                            <div className="text-4xl md:text-5xl font-black text-charcoal-blue mb-1">{stat.value}</div>
                            <div className="text-sm font-bold uppercase tracking-widest text-charcoal-blue/60">{stat.label}</div>
                        </div>
                     ))}
                </div>
            </div>
        </div>

        {/* CORE VALUES */}
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row gap-16">
                    <div className="md:w-1/3">
                        <h2 className="text-4xl font-black text-charcoal-blue mb-6">The Standard.</h2>
                        <p className="text-steel-gray text-lg">
                            Most contractors maximize profit by minimizing time on site. We maximize lifespan by obsessing over the install details you'll never see.
                        </p>
                    </div>
                    
                    <div className="md:w-2/3 space-y-12">
                        {settings.values?.map((value: any, index: number) => (
                            <div key={index} className="flex gap-6 group">
                                <div className="text-5xl font-black text-gray-200 group-hover:text-golden-yellow transition-colors select-none">
                                    0{index + 1}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-charcoal-blue mb-2">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* TRUST / CERTIFICATIONS */}
        <section className="bg-gray-100 py-24 px-6">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-black text-charcoal-blue mb-12">Licensed. Insured. Verified.</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center h-48">
                        <div className="font-black text-gray-300 text-xl mb-2">LICENSE</div>
                        <div className="font-bold text-charcoal-blue text-lg">{settings.licenseNumber || "TX Registered & Bonded"}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center h-48">
                        <div className="font-black text-gray-300 text-xl mb-2">INSURANCE</div>
                        <div className="font-bold text-charcoal-blue text-lg">{settings.insuranceAmount || "$2M General Liability"}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center h-48">
                        <div className="font-black text-gray-300 text-xl mb-2">IDA MEMBER</div>
                        <div className="font-bold text-charcoal-blue text-lg">Certified Techs</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center items-center h-48">
                        <div className="font-black text-gray-300 text-xl mb-2">RATING</div>
                        <div className="font-bold text-charcoal-blue text-lg">A+ BBB Accredited</div>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-blue py-24 px-6 text-center">
             <h2 className="text-white text-4xl font-black mb-8">Work with Mobil Garage Door.</h2>
             <a href="/contact" className="inline-block bg-golden-yellow hover:bg-white text-charcoal-blue font-bold py-4 px-10 rounded-xl transition-all transform hover:-translate-y-1 shadow-2xl">
                Request Service
             </a>
        </section>

      </main>
      <Footer />
    </div>
  );
}
