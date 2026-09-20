import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  padded?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  padded = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-150 ${
        padded ? 'p-4 sm:p-5' : ''
      } ${
        interactive
          ? 'hover:border-[#D5CEC1] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.995] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
