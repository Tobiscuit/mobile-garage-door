import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-surface border-t border-white/5 text-cloudy-white mt-auto">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold font-outfit text-white mb-4 uppercase tracking-wider">
              Mobile <span className="text-brand-yellow">Garage Door</span>
            </h3>
            <p className="text-steel-gray max-w-sm mb-6">
              The universal index for precision garage door specifications, maintenance protocols, and smart-view integration.
            </p>
            <div className="flex gap-4">
              {/* Social Media Icons */}
              {['Twitter', 'GitHub', 'Discord'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-charcoal-deep flex items-center justify-center text-steel-gray hover:text-brand-yellow hover:bg-white/5 transition-all border border-white/5">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current opacity-50"></div> {/* Placeholder icon */}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest text-brand-yellow">System</h4>
            <ul className="space-y-2">
              <li><Link href="/index" className="text-steel-gray hover:text-tech-cyan transition-colors">Index Database</Link></li>
              <li><Link href="/instant-view" className="text-steel-gray hover:text-tech-cyan transition-colors">Instant-View</Link></li>
              <li><Link href="/api" className="text-steel-gray hover:text-tech-cyan transition-colors">API Access</Link></li>
              <li><Link href="/status" className="text-steel-gray hover:text-tech-cyan transition-colors">System Status</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-widest text-brand-yellow">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-steel-gray hover:text-tech-cyan transition-colors">Privacy Protocol</Link></li>
              <li><Link href="/terms" className="text-steel-gray hover:text-tech-cyan transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-steel-gray hover:text-tech-cyan transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm text-steel-gray">
          <p>© 2025 Mobile Garage Door. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Systems Nominal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
