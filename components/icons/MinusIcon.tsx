import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const MinusIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
    >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M18 12H6" 
    />
  </svg>
);
