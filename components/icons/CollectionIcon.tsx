
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const CollectionIcon: React.FC<IconProps> = (props) => (
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
      d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v4.5A2.25 2.25 0 0119.5 13.875h-15A2.25 2.25 0 012.25 11.625v-4.5zM3.75 16.125A2.25 2.25 0 016 13.875h12A2.25 2.25 0 0120.25 16.125v2.25A2.25 2.25 0 0118 20.625H6A2.25 2.25 0 013.75 18.375v-2.25z" 
    />
  </svg>
);