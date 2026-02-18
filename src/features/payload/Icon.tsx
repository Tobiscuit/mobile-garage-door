'use client';

import React from 'react';

const Icon: React.FC = () => {
  return (
    <div className="icon-graphic" style={{ width: '100%', maxWidth: '24px', height: 'auto', aspectRatio: '1/1' }}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="24" height="24" rx="4" fill="#FFC107"/>
        <path d="M7 17V7L12 12L17 7V17" stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

export default Icon;
