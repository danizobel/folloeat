import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'text-3xl' }) => (
  <span className={`inline-flex items-baseline font-black tracking-[-0.065em] select-none ${className}`}>
    <span className="text-[#0284C7]">follo</span>
    <span className="text-[#EF4444] font-black pl-[0.06em]">eat.</span>
  </span>
);

export default Logo;
