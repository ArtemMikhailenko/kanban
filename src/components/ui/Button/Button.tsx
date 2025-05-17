// src/components/ui/Button/Button.tsx
import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

interface LinkButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string;
  isExternal?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const buttonClassName = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    isFullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClassName} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <span className={styles.spinner}></span>}
      {!isLoading && leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={isLoading ? styles.loadingText : ''}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </button>
  );
};

export const LinkButton = ({ 
  href, 
  children, 
  isExternal = false,
  ...buttonProps 
}: LinkButtonProps) => {
  const linkClassName = [
    styles.button,
    styles[`variant-${buttonProps.variant || 'primary'}`],
    styles[`size-${buttonProps.size || 'md'}`],
    buttonProps.isFullWidth ? styles.fullWidth : '',
    buttonProps.className || '',
  ].filter(Boolean).join(' ');

  if (isExternal) {
    return (
      <a 
        href={href} 
        className={linkClassName}
        target="_blank"
        rel="noopener noreferrer"
      >
        {buttonProps.leftIcon && <span className={styles.leftIcon}>{buttonProps.leftIcon}</span>}
        <span>{children}</span>
        {buttonProps.rightIcon && <span className={styles.rightIcon}>{buttonProps.rightIcon}</span>}
      </a>
    );
  }

  return (
    <Link 
      href={href}
      className={linkClassName}
    >
      {buttonProps.leftIcon && <span className={styles.leftIcon}>{buttonProps.leftIcon}</span>}
      <span>{children}</span>
      {buttonProps.rightIcon && <span className={styles.rightIcon}>{buttonProps.rightIcon}</span>}
    </Link>
  );
};