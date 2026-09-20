import React from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'charcoal' | 'neutral' | 'sky';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    emerald: 'bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]',
    amber: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    rose: 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]',
    charcoal: 'bg-[#292524] text-[#F8F6F0] border border-[#44403C]',
    neutral: 'bg-[#F2EFE8] text-[#57534E] border border-[#E2DDD2]',
    sky: 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
