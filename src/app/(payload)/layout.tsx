import React from 'react';
import './custom.css';

/* This is the root layout for the Payload Admin Panel */
const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default Layout;
