'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/features/payload/Logo';
import ThemeToggle from './ThemeToggle';

// Icons (Same as CustomNav but inline for simplicity or imported if shared)
const CommandIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ServiceIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProjectIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PostIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MediaIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const DispatchIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const EmailIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ChevronRight = () => <svg className="w-4 h-4 ml-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state logic here if needed

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    return (
      <Link 
        href={href} 
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
          ${active 
            ? 'text-[var(--staff-surface)] font-bold shadow-[0_0_20px_var(--staff-accent)]' 
            : 'hover:bg-[var(--staff-border)]/20'
          }
        `}
        style={{
          backgroundColor: active ? 'var(--staff-accent)' : 'transparent',
          color: active ? 'var(--staff-surface)' : 'var(--staff-muted)',
        }}
      >
        <span className={`relative z-10 ${active ? 'text-[var(--staff-surface)]' : 'group-hover:text-[var(--staff-accent)] transition-colors'}`}>
          <Icon />
        </span>
        <span className="relative z-10">{label}</span>
        {active && <ChevronRight />}
      </Link>
    );
  };

  const NavGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--staff-muted)' }}>{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE BOTTOM NAV - Visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl z-50 flex justify-around items-center p-2 pb-safe" style={{ backgroundColor: 'var(--staff-surface)', borderTop: '1px solid var(--staff-border)' }}>
        <Link href="/dashboard" className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isActive('/dashboard') && !isActive('/dashboard/dispatch') ? 'text-[var(--staff-accent)]' : ''}`} style={{ color: isActive('/dashboard') && !isActive('/dashboard/dispatch') ? 'var(--staff-accent)' : 'var(--staff-muted)' }}>
            <CommandIcon />
            <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/dashboard/dispatch" className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isActive('/dashboard/dispatch') ? 'text-[var(--staff-accent)]' : ''}`} style={{ color: isActive('/dashboard/dispatch') ? 'var(--staff-accent)' : 'var(--staff-muted)' }}>
            <DispatchIcon />
            <span className="text-[10px] font-bold">Dispatch</span>
        </Link>
        <Link href="/dashboard/services" className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isActive('/dashboard/services') ? 'text-[var(--staff-accent)]' : ''}`} style={{ color: isActive('/dashboard/services') ? 'var(--staff-accent)' : 'var(--staff-muted)' }}>
            <ServiceIcon />
            <span className="text-[10px] font-bold">Services</span>
        </Link>
        <Link href="/dashboard/settings" className={`p-2 rounded-lg flex flex-col items-center gap-1 ${isActive('/dashboard/settings') ? 'text-[var(--staff-accent)]' : ''}`} style={{ color: isActive('/dashboard/settings') ? 'var(--staff-accent)' : 'var(--staff-muted)' }}>
            <SettingsIcon />
            <span className="text-[10px] font-bold">Settings</span>
        </Link>
      </nav>

      {/* DESKTOP SIDEBAR - Hidden on small screens */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] backdrop-blur-xl flex-col z-50" style={{ backgroundColor: 'var(--staff-surface)', borderRight: '1px solid var(--staff-border)' }}>
        {/* LOGO AREA */}
        <div className="p-6 mb-2 shrink-0">
            <Link href="/dashboard" className="block w-40 hover:opacity-90 transition-opacity">
               <Logo />
            </Link>
        </div>

        {/* SCROLLABLE NAV */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
            <NavGroup title="Core">
                <NavItem href="/dashboard" icon={CommandIcon} label="Command Center" />
                <NavItem href="/dashboard/dispatch" icon={DispatchIcon} label="Dispatch Board" />
                <NavItem href="/dashboard/emails" icon={EmailIcon} label="Inbox" />
            </NavGroup>

            <NavGroup title="Operations">
                <NavItem href="/dashboard/services" icon={ServiceIcon} label="Services" />
                <NavItem href="/dashboard/projects" icon={ProjectIcon} label="Projects" />
                <NavItem href="/dashboard/testimonials" icon={UsersIcon} label="Testimonials" />
            </NavGroup>

            <NavGroup title="Content">
                <NavItem href="/dashboard/posts" icon={PostIcon} label="Blog Posts" />
                <NavItem href="/dashboard/media" icon={MediaIcon} label="Media Library" />
            </NavGroup>

            <NavGroup title="Configuration">
                <NavItem href="/dashboard/users" icon={UsersIcon} label="Users" />
                <NavItem href="/dashboard/settings" icon={SettingsIcon} label="Site Settings" />
            </NavGroup>
        </nav>

        {/* FOOTER */}
        <div className="p-4" style={{ borderTop: '1px solid var(--staff-border)' }}>
            <div className="mb-3">
                <ThemeToggle />
            </div>
            <Link href="/dashboard/logout" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all group">
                <LogoutIcon />
                <span className="font-bold group-hover:text-red-300">Log Out</span>
            </Link>
             <div className="mt-4 px-4 text-[10px] font-mono text-center" style={{ color: 'var(--staff-muted)' }}>
                Mobil Garage v2.0
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
