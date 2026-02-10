'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const CustomNav: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => {
    const active = isActive(href);
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          active 
            ? 'bg-[#f1c40f1a] text-[#f1c40f]' 
            : 'text-[#bdc3c7] hover:bg-[#ffffff05] hover:text-[#f7f9fb]'
        }`}
      >
        <div className={`w-5 h-5 transition-colors ${active ? 'text-[#f1c40f]' : 'text-[#7f8c8d] group-hover:text-[#f1c40f]'}`}>
          {icon}
        </div>
        <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
      </Link>
    );
  };

  const NavGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="px-4 text-xs font-bold text-[#bdc3c740] uppercase tracking-widest mb-2">{label}</div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <aside className="w-[280px] bg-[#34495e] border-r border-[#ffffff05] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 shadow-2xl">
      {/* LOGO HEADER */}
      <div className="p-6 mb-2">
        <div className="w-40">
           <Logo />
        </div>
      </div>

      {/* NAVIGATION SCROLL AREA */}
      <nav className="flex-1 px-4 pb-6">
        
        {/* CORE */}
        <NavGroup label="Core">
          <NavItem 
            href="/admin" 
            label="Command Center" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} 
          />
        </NavGroup>

        {/* OPERATIONS */}
        <NavGroup label="Operations">
          <NavItem 
            href="/admin/collections/service-requests" 
            label="Service Requests" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} 
          />
          <NavItem 
            href="/admin/collections/customers" 
            label="Customers" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>} 
          />
          <NavItem 
            href="/admin/collections/invoices" 
            label="Invoices" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} 
          />
          <NavItem 
            href="/admin/collections/payments" 
            label="Payments" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} 
          />
        </NavGroup>

        {/* CONTENT */}
        <NavGroup label="Content">
          <NavItem 
            href="/admin/collections/services" 
            label="Services" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} 
          />
           <NavItem 
            href="/admin/collections/projects" 
            label="Projects" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} 
          />
          <NavItem 
            href="/admin/collections/testimonials" 
            label="Testimonials" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h5m-5 4h5m-7-9a4 4 0 118 0 4 4 0 018 0zM3 21h18M3 10V9a4 4 0 014-4h10a4 4 0 014 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"/></svg>} 
          />
          <NavItem 
            href="/admin/collections/posts" 
            label="Posts (SEO)" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>} 
          />
           <NavItem 
            href="/admin/collections/media" 
            label="Media Library" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} 
          />
        </NavGroup>

        {/* SETTINGS */}
        <NavGroup label="Configuration">
          <NavItem 
            href="/admin/globals/site-settings" 
            label="Site Settings" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} 
          />
           <NavItem 
            href="/admin/collections/users" 
            label="Users" 
            icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} 
          />
        </NavGroup>

        {/* LOGOUT */}
        <div className="mt-8 pt-6 border-t border-[#ffffff10]">
          <Link href="/admin/logout" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
             <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
             <span className="font-bold">Log Out</span>
          </Link>
        </div>

      </nav>
    </aside>
  );
};

export default CustomNav;
