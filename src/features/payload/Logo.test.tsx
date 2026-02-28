import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo Component', () => {
  it('renders the MOBILGARAGE text', () => {
    render(<Logo />);
    
    // React testing library searches by text content.
    // Because it's split into "MOBIL" and "GARAGE" spans, we can just search for the text.
    expect(screen.getByText(/MOBIL/i)).toBeInTheDocument();
    expect(screen.getByText(/GARAGE/i)).toBeInTheDocument();
  });

  it('uses the customizable --staff-text CSS variable for the text color', () => {
    const { container } = render(<Logo />);
    
    // Get the outer div that holds the text styling
    const outerDiv = container.firstChild as HTMLElement;
    
    // Verify the style logic is wired strictly to the CSS variable
    expect(outerDiv).toHaveStyle('color: var(--staff-text)');
  });
});
