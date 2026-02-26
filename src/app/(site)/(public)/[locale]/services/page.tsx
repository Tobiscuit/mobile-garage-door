import React from 'react';
import { getPayloadClient } from '@/lib/payload';
import { getTranslations } from 'next-intl/server';

// Icon mapping helper
const getIcon = (iconName: string, highlight: boolean) => {
  const className = `w-8 h-8 ${highlight ? 'text-red-400' : 'text-golden-yellow'}`; // Default colors, adjusted below per icon
  
  switch (iconName) {
    case 'lightning': // Repair
      return <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
    case 'building': // Install
      return <svg className="w-8 h-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>;
    case 'clipboard': // Maintenance
      return <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2-2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
    case 'phone': // Automation
      return <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>;
    default:
      return <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
  }
};

export const dynamic = 'force-dynamic';

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const payload = await getPayloadClient();
  const t = await getTranslations({ locale, namespace: 'services_page' });
  const { docs: services } = await payload.find({
    collection: 'services',
    sort: 'order',
    locale: locale as 'en' | 'es',
  });

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans">
      
      {/* BIFURCATED HERO: Services Edition */}
      <section className="relative flex flex-col md:flex-row text-white overflow-hidden font-display min-h-[60vh]">
            {/* LEFT: URGENT */}
            <div className="relative w-full md:w-1/2 bg-dark-charcoal flex flex-col justify-center px-8 md:px-16 pt-48 pb-20 border-r border-white/5">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        {t('rapid_response')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                        {t('broken_title')} <span className="text-red-500">{t('broken_accent')}</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-sm">
                        {t('broken_desc')}
                    </p>
                    <a href="/contact?type=repair" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all">
                        {t('dispatch_cta')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </a>
                </div>
            </div>

            {/* RIGHT: PLANNED */}
            <div className="relative w-full md:w-1/2 bg-charcoal-blue flex flex-col justify-center px-8 md:px-16 pt-48 pb-20">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#f1c40f 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-golden-yellow/10 border border-golden-yellow/20 text-golden-yellow px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                        {t('project_design')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                        {t('new_title')} <span className="text-golden-yellow">{t('new_accent')}</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-sm">
                        {t('new_desc')}
                    </p>
                    <a href="/contact?type=install" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-all border border-white/10">
                        {t('start_project')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </a>
                </div>
            </div>
        </section>

        {/* SERVICE MATRIX (Bento Grid) */}
        <section className="py-24 bg-cloudy-white px-6">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-charcoal-blue text-4xl font-black mb-4">{t('capabilities_heading')}</h2>
                        <p className="text-steel-gray max-w-xl text-lg">
                            {t('capabilities_desc')}
                        </p>
                    </div>
                    <div className="hidden md:block">
                         <div className="text-right">
                            <div className="text-3xl font-black text-charcoal-blue">{t('repairs_stat')}</div>
                            <div className="text-sm font-bold text-steel-gray uppercase tracking-wider">{t('repairs_label')}</div>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <div key={index} className={`group relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${service.highlight ? 'bg-charcoal-blue text-white ring-4 ring-charcoal-blue/10' : 'bg-white text-charcoal-blue shadow-lg border border-gray-100'}`}>
                            
                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-3 rounded-lg ${service.highlight ? 'bg-white/10' : 'bg-gray-50'}`}>
                                    {getIcon(service.icon, service.highlight || false)}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider py-1 px-2 rounded ${service.highlight ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                                    {service.category}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                            <p className={`mb-8 leading-relaxed ${service.highlight ? 'text-gray-400' : 'text-steel-gray'}`}>
                                {service.description}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {service.features?.map((item: any, i: number) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                        <div className={`w-1.5 h-1.5 rounded-full ${service.highlight ? 'bg-golden-yellow' : 'bg-charcoal-blue'}`}></div>
                                        <span className={service.highlight ? 'text-gray-300' : 'text-gray-600'}>{item.feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a href={`/contact?service=${service.slug}`} className={`absolute bottom-8 left-8 right-8 py-3 text-center rounded-lg font-bold transition-colors ${service.highlight ? 'bg-golden-yellow text-charcoal-blue hover:bg-white' : 'bg-gray-50 text-charcoal-blue hover:bg-gray-100'}`}>
                                {t('configure_service')}
                            </a>
                             {/* Spacer for button */}
                             <div className="h-12"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* TRUST BANNER */}
        <section className="bg-charcoal-blue py-16 border-t border-white/10">
            <div className="container mx-auto px-6 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">{t('dealer_heading')}</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
                    <span className="text-2xl font-black text-white">LIFTMASTER</span>
                    <span className="text-2xl font-black text-white">CHAMBERLAIN</span>
                    <span className="text-2xl font-black text-white">AMARR</span>
                    <span className="text-2xl font-black text-white">CLOPAY</span>
                </div>
            </div>
        </section>

    </div>
  );
}
