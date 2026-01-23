import React from 'react';

const Services: React.FC = () => {
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
            Diagnosis & <span className="text-golden-yellow">Solutions.</span>
          </h2>
          <p className="text-lg text-steel-gray">
            Identify your issue below. We deploy the right specialist within hours, not days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
          
          {/* ISLAND 1: EMERGENCY REPAIR (Symptom Based) */}
          <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              High Priority
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <h3 className="text-3xl font-bold text-charcoal-blue mb-2">Something Broken?</h3>
                <p className="text-steel-gray mb-6 text-lg">Most common issues we fix same-day:</p>
                <ul className="space-y-3">
                  {['Door Stuck / Won\'t Open', 'Loud Grinding Noise', 'Broken Spring (Pop Sound)', 'Off Track / Crooked', 'Opener Unresponsive'].map((item, i) => (
                    <li key={i} className="flex items-center text-charcoal-blue font-medium">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="#repair" className="mt-8 inline-flex items-center text-red-600 font-bold group-hover:translate-x-2 transition-transform">
                Request Emergency Tech <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
            </div>
          </div>

          {/* ISLAND 2: B2B CONTRACTOR (Premium/Bold) */}
          <div className="md:col-span-1 md:row-span-1 bg-charcoal-blue text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-golden-yellow rounded-lg flex items-center justify-center text-charcoal-blue mb-4 shadow-lg shadow-yellow-900/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Contractors & Builders</h3>
              <p className="text-gray-400 text-sm mb-4">Volume pricing, dedicated project managers, and 100% schedule reliability.</p>
              <a href="/contact?type=contractor" className="text-golden-yellow font-bold text-sm tracking-wide uppercase border-b border-golden-yellow/30 pb-1 hover:border-golden-yellow transition-colors">
                Access Pro Portal
              </a>
            </div>
          </div>

          {/* ISLAND 3: DESIGN & INSTALL (Aesthetic) */}
          <div className="md:col-span-1 md:row-span-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between group hover:border-golden-yellow/30 transition-colors">
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-charcoal-blue mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-charcoal-blue mb-2">New Installations</h3>
              <p className="text-steel-gray text-sm">Visualize your home's potential. Modern, Carriage, and Glass styles.</p>
            </div>
            <a href="/portfolio" className="text-charcoal-blue font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center mt-4">
              Browse Gallery <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Services;
