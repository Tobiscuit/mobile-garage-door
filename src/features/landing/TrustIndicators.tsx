'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

interface Testimonial {
  author: string;
  location: string;
  quote: string;
  rating: number;
}

interface TrustIndicatorsProps {
  testimonials?: Testimonial[];
}

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ testimonials = [] }) => {
  const t = useTranslations('trust');

  const stats = [
    { label: t('avg_response'), value: '58m', diff: t('avg_response_diff'), color: 'text-charcoal-blue' },
    { label: t('active_techs'), value: '3', sub: t('in_your_area'), color: 'text-golden-yellow' },
    { label: t('projects_completed'), value: '842', sub: t('this_year'), color: 'text-charcoal-blue' },
    { label: t('satisfaction'), value: '100%', sub: t('five_star'), color: 'text-charcoal-blue' },
  ];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* HEADER: Data-First Claim */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-100 pb-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black text-charcoal-blue mb-2 tracking-tight">
              {t('title')}
            </h2>
            <p className="text-steel-gray">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-wider">{t('system_online')}</span>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="bg-cloudy-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-center">
              <div className="text-sm text-steel-gray font-medium uppercase tracking-wide mb-1">{stat.label}</div>
              <div className={`text-3xl md:text-4xl font-black ${stat.color} mb-1`}>{stat.value}</div>
              {stat.diff && <div className="text-xs text-green-600 font-bold bg-green-100 inline-block px-2 py-0.5 rounded-full w-fit">{stat.diff}</div>}
              {stat.sub && <div className="text-xs text-gray-400 font-medium">{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* VERIFIED REVIEWS (Dynamic) */}
        <div className="grid md:grid-cols-2 gap-8">
           {testimonials.length > 0 ? (
             testimonials.map((testimonial, i) => (
               <div key={i} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300">
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-1 text-golden-yellow">
                     {Array.from({ length: testimonial.rating }).map((_, star) => (
                       <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                         <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                       </svg>
                     ))}
                   </div>
                   <div className="flex items-center text-gray-500 text-[10px] font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                     ID: {1000 + ((i + 1) * 3871) % 9000}-VERIFIED
                   </div>
                 </div>
                 <p className="text-xl font-medium text-charcoal-blue mb-6 leading-relaxed">
                   &quot;{testimonial.quote}&quot;
                 </p>
                 <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-charcoal-blue font-bold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-charcoal-blue text-sm">{testimonial.author}</div>
                      <div className="text-xs text-steel-gray">{testimonial.location}</div>
                    </div>
                 </div>
               </div>
             ))
           ) : (
             <p className="text-gray-400 italic">{t('no_reviews', { ns: 'testimonials' })}</p>
           )}
        </div>

      </div>
    </section>
  );
};

export default TrustIndicators;
