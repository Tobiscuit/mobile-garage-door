'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNav } from '@payloadcms/ui';
import Logo from './Logo';

// Icons
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/></svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 1-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const MessageSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
const WrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

const CustomNav: React.FC = () => {
  const pathname = usePathname();
  // Hook into Payload's nav state to ensure layout compatibility or just for refs
  // Ideally, if we replace the *entire* nav, we need to provide the `nav` class.
  // The useNav hook provides: navOpen, setNavOpen, navRef, hydrated, shouldAnimate
  const { navOpen, navRef, hydrated, shouldAnimate } = useNav();
  const baseClass = 'nav';

  // Construct classes exactly like Payload's default NavWrapper to ensure layout works
  const classes = [
    baseClass,
    navOpen && `${baseClass}--nav-open`,
    shouldAnimate && `${baseClass}--nav-animate`,
    hydrated && `${baseClass}--nav-hydrated`,
    // Our custom overrides (ensure they have high enough specificity or order)
    'bg-[#2c3e50]/95 backdrop-blur-xl border-r border-[#ffffff08] flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-[100] transition-transform duration-300 ease-in-out',
    navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
  ].filter(Boolean).join(' ');

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
    <aside className={classes} ref={navRef} aria-hidden={!navOpen}>
      <div className={`${baseClass}__scroll h-full flex flex-col overflow-y-auto custom-scrollbar`}>
        {/* LOGO HEADER */}
        <div className="p-6 mb-2 shrink-0">
            <Link href="/admin" className="block w-40 hover:opacity-90 transition-opacity">
               <Logo />
            </Link>
        </div>

        {/* NAVIGATION SCROLL AREA */}
        <nav className="flex-1 px-4 pb-6">
            
            {/* CORE */}
            <NavGroup label="Core">
            <NavItem 
                href="/admin" 
                label="Command Center" 
                icon={<HomeIcon />} 
            />
            </NavGroup>

            {/* OPERATIONS */}
            <NavGroup label="Operations">
            <NavItem 
                href="/admin/collections/services" 
                label="Services" 
                icon={<WrenchIcon />} 
            />
            <NavItem 
                href="/admin/collections/projects" 
                label="Portfolio Projects" 
                icon={<BriefcaseIcon />} 
            />
            </NavGroup>

            {/* CONTENT */}
            <NavGroup label="Content">
            <NavItem 
                href="/admin/collections/posts" 
                label="Blog Posts" 
                icon={<FileTextIcon />} 
            />
            <NavItem 
                href="/admin/collections/testimonials" 
                label="Testimonials" 
                icon={<MessageSquareIcon />} 
            />
             <NavItem 
                href="/admin/collections/media" 
                label="Media Library" 
                icon={<ImageIcon />} 
            />
            </NavGroup>

            {/* CONFIGURATION */}
            <NavGroup label="Configuration">
            <NavItem 
                href="/admin/globals/site-settings" 
                label="Site Settings" 
                icon={<SettingsIcon />} 
            />
            <NavItem 
                href="/admin/collections/users" 
                label="Users" 
                icon={<UsersIcon />} 
            />
            </NavGroup>

            {/* LOGOUT */}
            <div className="mt-8 pt-6 border-t border-[#ffffff10]">
            <Link href="/admin/logout" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                <LogoutIcon />
                <span className="font-bold">Log Out</span>
            </Link>
            </div>

            {/* Footer / Meta Links */}
            <div className="mt-4 px-4 text-xs text-[#ecf0f1] font-mono opacity-30">
                <div>Mobil Garage Door</div>
                <div>v1.0.0 (Bleeding Edge)</div>
            </div>

        </nav>
      </div>
    </aside>
  );
};

export default CustomNav;
