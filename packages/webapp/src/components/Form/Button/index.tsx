import React, { ReactNode } from 'react';
import styles from './button.module.scss';
import clsx from 'clsx';

type ButtonProps = {
  color?: 'primary' | 'secondary' | 'success' | 'none';
  children?: ReactNode;
  sm?: boolean;
  disabled?: boolean;
  fullLength?: boolean;
  className?: string;
  onClick?(): void;
  type?: 'button' | 'submit' | 'reset';
  inputRef?: any;
  id?: string;
};

const Button = ({
  color = 'primary',
  children = 'Button',
  sm,
  disabled = false,
  fullLength = false,
  className,
  onClick,
  type,
  inputRef,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        styles.btn,
        color && styles[color],
        sm && styles.sm,
        fullLength && styles.fullLength,
        className,
      )}
      onClick={onClick}
      type={type}
      ref={inputRef}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
