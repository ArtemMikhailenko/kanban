// src/components/ui/Input/Input.tsx
import React, { useState, useRef, forwardRef } from 'react';
import styles from './Input.module.css';
import { useId } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  isFullWidth?: boolean;
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      isFullWidth = true,
      variant = 'default',
      size = 'md',
      isRequired = false,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Використовуємо вхідний ref або створюємо новий, якщо не передано
    const inputRefToUse = (ref as React.RefObject<HTMLInputElement>) || inputRef;
    
    // Генеруємо унікальний ID для інпуту, якщо не передано
    const inputId = useId();
    
    const containerClasses = [
      styles.container,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      isFullWidth ? styles.fullWidth : '',
      isFocused ? styles.focused : '',
      error ? styles.hasError : '',
      disabled ? styles.disabled : '',
      containerClassName
    ].filter(Boolean).join(' ');
    
    const labelClasses = [
      styles.label,
      isRequired ? styles.required : '',
      labelClassName
    ].filter(Boolean).join(' ');
    
    const inputClasses = [
      styles.input,
      leftIcon ? styles.hasLeftIcon : '',
      rightIcon ? styles.hasRightIcon : '',
      inputClassName
    ].filter(Boolean).join(' ');
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    // Функція для фокусування на інпуті при кліку на контейнер
    const focusInput = () => {
      if (inputRefToUse.current && !disabled) {
        inputRefToUse.current.focus();
      }
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        
        <div className={styles.inputWrapper} onClick={focusInput}>
          {leftIcon && (
            <div className={styles.leftIcon}>
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={inputRefToUse}
            type={type}
            disabled={disabled}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightIcon && (
            <div 
              className={styles.rightIcon} 
              onClick={(e) => {
                e.stopPropagation();
                if (onRightIconClick) onRightIconClick();
              }}
              tabIndex={onRightIconClick ? 0 : -1}
              role={onRightIconClick ? 'button' : undefined}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || hint) && (
          <div className={error ? styles.error : styles.hint}>
            {error || hint}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;