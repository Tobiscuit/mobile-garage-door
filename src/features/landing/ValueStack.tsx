import React from 'react';

const ValueStack: React.FC = () => {
  return (
    <section className="py-20 bg-charcoal-blue text-white relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
      
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: The Proposition */}
          <div>
            <div className="inline-block bg-golden-yellow/20 text-golden-yellow font-bold px-4 py-2 rounded-full mb-6 border border-golden-yellow/30">
              The "No-Headache" Guarantee
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              We kill the risks<br />
              <span className="text-gray-400">that others ignore.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Most contractors fail on schedule, price, or quality. We engineered a system that makes failure impossible.
            </p>
            <a href="/contact" className="inline-flex items-center text-white border-b-2 border-golden-yellow pb-1 font-bold hover:text-golden-yellow transition-colors">
              Read our Service Level Agreement <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>

          {/* RIGHT: The Stack */}
          <div className="space-y-4">
            {[
              { title: 'Fully Licensed & Insured', desc: '$2M Liability Coverage per project site.', icon: 'shield' },
              { title: 'Zero Hidden Fees', desc: 'Flat-rate pricing approved before we start.', icon: 'tag' },
              { title: '2-Hour Window', desc: 'We track our trucks so you don\'t wait all day.', icon: 'clock' },
              { title: 'Background Checked', desc: 'Uniformed, drug-tested W2 employees. No random subs.', icon: 'user' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-golden-yellow/10 flex items-center justify-center text-golden-yellow">
                  {item.icon === 'shield' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  {item.icon === 'tag' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>}
                  {item.icon === 'clock' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  {item.icon === 'user' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ValueStack;
