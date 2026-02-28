import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PortalHeader } from './PortalHeader';

// Mock Next.js Link component to render as a simple anchor tag in tests
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PortalHeader UI Component', () => {
  it('renders the customer name correctly', () => {
    render(<PortalHeader customerName="Juan Admin" />);
    
    // Check that the welcome message and customer name render
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Juan Admin')).toBeInTheDocument();
    
    // Check that the Admin View button does NOT render for regular customers
    expect(screen.queryByText(/Admin View/i)).not.toBeInTheDocument();
  });

  it('renders the [Admin View] button ONLY when isAdmin is true', () => {
    render(<PortalHeader customerName="Juan Admin" isAdmin={true} />);
    
    // The Admin View button should now be visible!
    const adminButton = screen.getByText(/Admin View/i);
    expect(adminButton).toBeInTheDocument();
    
    // It should link back to the command center
    expect(adminButton.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('renders Builder specific syntax when isBuilder is true', () => {
    render(<PortalHeader customerName="Best Builds LLC" isBuilder={true} />);
    
    expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage active job sites/i)).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });
});
