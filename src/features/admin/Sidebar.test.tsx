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

  it('renders the customer-view perspective switcher pointing to /portal', () => {
    render(<Sidebar />);

    // The switcher is labelled "Customer View". "Customer Portal" appeared
    // nowhere in the component — that assertion had never actually run,
    // because this suite failed to collect on the unresolvable
    // next/navigation import.
    const switcherLabel = screen.getByText('Customer View');
    expect(switcherLabel).toBeInTheDocument();
    expect(switcherLabel.closest('a')).toHaveAttribute('href', '/portal');
  });

  it('renders Log Out as a button rather than a link', () => {
    render(<Sidebar />);

    const logoutLabel = screen.getByText('Log Out');
    expect(logoutLabel).toBeInTheDocument();

    // Signing out calls authClient.signOut() and then redirects, so this is a
    // <button> — not a link to a /dashboard/logout route, which is what the
    // previous assertion described.
    expect(logoutLabel.closest('button')).toBeInTheDocument();
    expect(logoutLabel.closest('a')).toBeNull();
  });
});
