import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-400 border-t border-white/10 pt-20 pb-10 text-sm font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* BRAND */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-xl font-bold mb-6 font-display tracking-tight">MOBIL<span className="text-gray-600">GARAGE</span></h3>
            <p className="leading-relaxed mb-6">
              The premier automated access solution for residential builders and discerning homeowners.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders - minimalist */}
               <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-golden-yellow hover:text-black transition-colors flex items-center justify-center cursor-pointer">IG</div>
               <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-golden-yellow hover:text-black transition-colors flex items-center justify-center cursor-pointer">LN</div>
            </div>
          </div>

          {/* SERVICE AREA */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Deployment Zones</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Greater Katy & West Houston</a></li>
              <li><a href="#" className="hover:text-white transition-colors">The Woodlands & North Houston</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sugar Land & Richmond</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Houston Interior & Heights</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Client Support</h4>
            <ul className="space-y-3">
              <li><a href="/contact" className="hover:text-white transition-colors">Submit Warranty Claim</a></li>
              <li><a href="/contact?type=contractor" className="hover:text-white transition-colors">Contractor Portal Login</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergency Dispatch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SLA Documentation</a></li>
            </ul>
          </div>

          {/* OFFICIAL DATA */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Official Data</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-600 uppercase">State License</div>
                <div className="text-white font-mono">#9942-B-RES</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase">Insurance</div>
                <div className="text-white font-mono">Liberty Mutual • $2M Agg</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase">HQ Dispatch</div>
                <div className="text-white">
                  Rapid Response Unit<br />
                  Houston & Surrounding Areas
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Mobil Garage Door Inc. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            SYSTEMS OPERATIONAL
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
