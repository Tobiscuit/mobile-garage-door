'use client';

import React from 'react';

const Logo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      fontFamily: '"Work Sans", system-ui, sans-serif',
      fontSize: '20px',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      color: '#f7f9fb'
    }}>
      <div style={{ width: '32px', height: '32px', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <rect width="24" height="24" rx="6" fill="#FFC107"/>
            <path d="M7 17V7L12 12L17 7V17" stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span>
        MOBIL<span style={{ fontWeight: '400', opacity: 0.7 }}>GARAGE</span>
      </span>
    </div>
  );
};

export default Logo;
