import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      fontFamily: 'sans-serif',
      fontSize: '24px',
      fontWeight: '900',
      letterSpacing: '-0.05em',
      color: '#fff'
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        backgroundColor: '#FFC107', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000'
      }}>
        M
      </div>
      <span>
        MOBIL<span style={{ color: '#555', fontWeight: '300' }}>GARAGE</span>
      </span>
    </div>
  );
};
