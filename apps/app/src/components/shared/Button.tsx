/**
 * @file Accessible button and action link component for TallyBakery.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'copper' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  'aria-label'?: string;
}

/**
 * @description Renders a styled accessible button or navigation link following brand design tokens.
 * @param {ButtonProps} props - Button configuration.
 * @returns {React.ReactElement} Action element.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  icon,
  iconPosition = 'right',
  'aria-label': ariaLabel,
}: ButtonProps): React.ReactElement {
  const baseStyles =
    'inline-flex items-center justify-center font-medium font-sans transition-all duration-150 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#0B5C63] text-[#F6F3EA] hover:bg-[#0F7480] shadow-sm focus-visible:ring-[#0B5C63] border border-transparent',
    secondary:
      'bg-[#EFEBDB] text-[#10201F] hover:bg-[#EFEBDB]/70 border border-[#D9D3C0] focus-visible:ring-[#0B5C63]',
    copper:
      'bg-[#A9501A] text-[#F6F3EA] hover:bg-[#8f4314] shadow-sm focus-visible:ring-[#A9501A] border border-transparent',
    ghost:
      'bg-transparent text-[#10201F] hover:bg-[#EFEBDB]/50 border border-transparent focus-visible:ring-[#0B5C63]',
    dark:
      'bg-[#0C1716] text-[#E9E4D2] hover:bg-[#10201F] border border-[#52C2C9]/30 focus-visible:ring-[#52C2C9]',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';
  const combinedClasses = `${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
