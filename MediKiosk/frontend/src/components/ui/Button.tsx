'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 touch-target";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-sm min-h-[40px]",
    md: "px-5 py-3 text-base min-h-[48px]",
    lg: "px-6 py-4 text-lg font-semibold min-h-[56px]",
    xl: "px-8 py-5 text-xl font-bold min-h-[64px]",
  }[size];

  const variantStyles = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30",
    secondary: "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200",
    outline: "bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-3">
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      )}
    </button>
  );
};
