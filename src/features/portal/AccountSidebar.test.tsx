import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { AccountSidebar } from './AccountSidebar';

// Mock PasskeyManager to keep test focused
vi.mock('./PasskeyManager', () => ({
  PasskeyManager: () => <div data-testid="mock-passkey-manager">Passkey Manager</div>,
}));

// Mock the authClient to intercept signOut
const mockSignOut = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: mockSignOut,
  },
}));

// Mock window.location
const originalLocation = window.location;

describe('AccountSidebar UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the location object securely for TypeScript
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });

  it('renders customer details correctly', () => {
    const customer = { name: 'Alice', email: 'alice@example.com', phone: '123-456-7890' };
    render(<AccountSidebar customer={customer} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
  });

  it('renders the PasskeyManager', () => {
    const customer = { name: 'Alice', email: 'alice@example.com', phone: '123-456-7890' };
    render(<AccountSidebar customer={customer} />);
    
    expect(screen.getByTestId('mock-passkey-manager')).toBeInTheDocument();
  });

  it('calls authClient.signOut and redirects when Sign Out is clicked', async () => {
    const customer = { name: 'Alice', email: 'alice@example.com', phone: '123-456-7890' };
    render(<AccountSidebar customer={customer} />);
    
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(window.location.href).toBe('/');
    });
  });
});
