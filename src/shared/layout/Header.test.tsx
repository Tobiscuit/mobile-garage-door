import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from './Header';
import { authClient } from '@/lib/auth-client';

// Mock next-intl translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'login') return 'PORTAL LOGIN';
    return key;
  },
}));

// Mock Next.js routing & links
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

describe('Header UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PORTAL LOGIN pointing to /login when there is no active session', () => {
    // Mock no session
    (authClient.useSession as any).mockReturnValue({ data: null });
    
    render(<Header />);
    
    const loginLinks = screen.getAllByText('PORTAL LOGIN');
    expect(loginLinks.length).toBeGreaterThan(0);
    
    // Check that the desktop link points to /login
    const desktopLink = loginLinks[0].closest('a');
    expect(desktopLink).toHaveAttribute('href', '/login');
  });

  it('renders DASHBOARD pointing to /app when a user is logged in', () => {
    // Mock active session
    (authClient.useSession as any).mockReturnValue({ 
      data: { user: { id: '123', email: 'test@test.com' } } 
    });
    
    render(<Header />);
    
    // Portal Login should NOT be in the document
    expect(screen.queryByText('PORTAL LOGIN')).not.toBeInTheDocument();
    
    // Dashboard should be in the document
    const dashboardLinks = screen.getAllByText('DASHBOARD');
    expect(dashboardLinks.length).toBeGreaterThan(0);
    
    const desktopLink = dashboardLinks[0].closest('a');
    expect(desktopLink).toHaveAttribute('href', '/app');
  });
});
