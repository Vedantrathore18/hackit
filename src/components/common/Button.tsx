import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-5 py-3.5 gap-2.5 h-12',
  };

  const variantStyles = {
    primary: 'bg-[#1C1917] text-[#F8F6F0] hover:bg-[#292524] shadow-sm',
    secondary: 'bg-[#EFECE4] text-[#1C1917] hover:bg-[#E5E0D4]',
    outline: 'border border-[#D8D2C4] text-[#1C1917] hover:bg-[#F2EFE8] bg-white/70',
    ghost: 'text-[#57534E] hover:bg-[#EFECE4] hover:text-[#1C1917]',
    emerald: 'bg-[#15803D] text-white hover:bg-[#166534] shadow-sm',
    amber: 'bg-[#D97706] text-white hover:bg-[#B45309] shadow-sm',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
