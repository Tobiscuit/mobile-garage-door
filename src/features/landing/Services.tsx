'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface ServiceFeature {
  feature: string;
}

interface Service {
  title: string;
  slug: string;
  category: string;
  description: string;
  highlight?: boolean | null;
  icon: 'lightning' | 'building' | 'clipboard' | 'phone';
  features?: ServiceFeature[] | null;
}

interface ServicesProps {
  services?: Service[];
}

const IconMap = {
  lightning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const Services: React.FC<ServicesProps> = ({ services = [] }) => {
  const t = useTranslations('services_landing');
  return (
    <section id="services" className="py-24 bg-cloudy-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-golden-yellow rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-charcoal-blue rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-charcoal-blue mb-4 tracking-tight">
            {t('heading')} <span className="text-golden-yellow">{t('heading_accent')}</span>
          </h2>
          <p className="text-lg text-steel-gray">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
          {services.map((service, i) => {
            const isFirst = i === 0;
            const isHighPriority = service.category === 'Critical Response';
            
            return (
              <div 
                key={service.slug}
                className={`
                  rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group transition-all duration-300
                  ${service.highlight ? 'bg-charcoal-blue text-white hover:-translate-y-1' : 'bg-white text-charcoal-blue hover:shadow-2xl'}
                  ${isFirst ? 'md:col-span-2' : 'md:col-span-1'}
                `}
              >
                {isHighPriority && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    {t('high_priority')}
                  </div>
                )}
                
                {service.highlight && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                )}

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110
                      ${service.highlight ? 'bg-golden-yellow text-charcoal-blue' : 'bg-red-500 text-white'}
                    `}>
                      {IconMap[service.icon] || IconMap.lightning}
                    </div>
                    <h3 className={`text-3xl font-bold mb-2 ${service.highlight ? 'text-white' : 'text-charcoal-blue'}`}>
                      {service.title}
                    </h3>
                    <p className={`mb-6 text-lg ${service.highlight ? 'text-gray-400' : 'text-steel-gray'}`}>
                      {service.description}
                    </p>
                    
                    {service.features && (
                      <ul className="space-y-3">
                        {service.features.map((f, idx) => (
                          <li key={idx} className="flex items-center font-medium">
                            <span className={`w-2 h-2 rounded-full mr-3 ${service.highlight ? 'bg-golden-yellow' : 'bg-red-400'}`}></span>
                            {f.feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <a 
                    href={service.slug === 'contractor-portal' ? '/contact?type=contractor' : (service.slug === 'installations' ? '/portfolio' : '#repair')}
                    className={`mt-8 inline-flex items-center font-bold transition-transform hover:translate-x-2
                      ${service.highlight ? 'text-golden-yellow text-sm tracking-wide uppercase border-b border-golden-yellow/30 pb-1 hover:border-golden-yellow' : 'text-red-600'}
                    `}
                  >
                    {service.slug === 'contractor-portal' ? t('cta_portal') : (service.slug === 'installations' ? t('cta_gallery') : t('cta_emergency'))}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
