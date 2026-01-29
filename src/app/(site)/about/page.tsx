import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const stats = [
    { value: '15+', label: 'Years in Service' },
    { value: '5,000+', label: 'Repairs Completed' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Emergency Response' },
  ];

  const values = [
    {
      title: 'Reliability',
      description: 'We show up when we say we will. No excuses, no delays.',
      icon: (
        <svg className="w-8 h-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ),
    },
    {
      title: 'Transparency',
      description: 'Upfront pricing. No hidden fees. What we quote is what you pay.',
      icon: (
        <svg className="w-8 h-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
      ),
    },
    {
      title: 'Expertise',
      description: 'Factory-trained technicians with the tools for any job.',
      icon: (
        <svg className="w-8 h-8 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-cloudy-white font-work-sans">
      <Header />
      <main className="flex-grow">
        
        {/* HERO: Industrial Story */}
        <section className="bg-charcoal-blue text-white py-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-white/20 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                Our Story
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                Built on <span className="text-golden-yellow">Trust.</span>
                <br />Driven by <span className="text-golden-yellow">Results.</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                What started as a single truck and a commitment to honest work has grown into the region's most trusted mobile garage door service. We are not a call center—we are your neighbors.
              </p>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="bg-dark-charcoal py-12 border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl md:text-5xl font-black text-white">{stat.value}</div>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="py-24 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-charcoal-blue mb-4">Our Core Values</h2>
              <p className="text-lg text-steel-gray max-w-2xl mx-auto">
                Every technician on our team lives by these principles. They're not just words on a wall—they're how we operate.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:-translate-y-1 transition-transform">
                  <div className="w-16 h-16 mx-auto mb-6 bg-charcoal-blue/5 rounded-xl flex items-center justify-center group-hover:bg-golden-yellow/10 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-blue mb-3">{value.title}</h3>
                  <p className="text-steel-gray leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION STATEMENT */}
        <section className="bg-golden-yellow py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-black text-charcoal-blue mb-6">Our Mission</h2>
            <p className="text-xl text-charcoal-blue/80 max-w-3xl mx-auto leading-relaxed">
              To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.
            </p>
          </div>
        </section>

        {/* CERTIFICATIONS / TRUST */}
        <section className="py-20 bg-cloudy-white px-6">
          <div className="container mx-auto text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Licensed, Bonded & Insured</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              <div className="text-center">
                <div className="text-2xl font-black text-charcoal-blue">CA LIC #1045678</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">State Contractor</div>
              </div>
              <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-charcoal-blue">$2M Policy</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Liability Insurance</div>
              </div>
              <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
              <div className="text-center">
                <div className="text-2xl font-black text-charcoal-blue">BBB A+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Accredited Business</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-blue py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-black text-white mb-6">Ready to Work With Us?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/contact" className="bg-golden-yellow text-charcoal-blue font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Get a Free Quote
              </a>
              <a href="tel:555-000-0000" className="bg-white/10 text-white font-bold py-4 px-8 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                Call 24/7 Hotline
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
