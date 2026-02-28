import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

// Mock Next.js routing & links
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Mock child components
vi.mock('@/features/payload/Logo', () => ({
  default: () => <div data-testid="mock-logo">Logo</div>,
}));

vi.mock('./ThemeToggle', () => ({
  default: () => <div data-testid="mock-theme-toggle">Theme Toggle</div>,
}));

describe('Admin Sidebar Component', () => {
  it('renders standard navigation links', () => {
    render(<Sidebar />);
    
    // Core Links
    const commandCenterLinks = screen.getAllByText('Command Center');
    expect(commandCenterLinks.length).toBeGreaterThan(0);
    expect(screen.getByText('Dispatch Board')).toBeInTheDocument();
  });

  it('renders the Customer Portal perspective switcher link', () => {
    render(<Sidebar />);
    
    const portalLinkText = screen.getByText('Customer Portal');
    expect(portalLinkText).toBeInTheDocument();
    
    const portalLink = portalLinkText.closest('a');
    expect(portalLink).toHaveAttribute('href', '/portal');
  });

  it('renders the Log Out button pointing to /dashboard/logout', () => {
    render(<Sidebar />);
    
    const logoutLinkText = screen.getByText('Log Out');
    expect(logoutLinkText).toBeInTheDocument();
    
    const logoutLink = logoutLinkText.closest('a');
    expect(logoutLink).toHaveAttribute('href', '/dashboard/logout');
  });
});
