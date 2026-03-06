import React from 'react';

export default function Link({ href, children, ...props }: any) {
  return (
    <a href={href} suppressHydrationWarning {...props}>
      {children}
    </a>
  );
}
