import React, { ReactNode } from 'react';
import styles from './button.module.scss';
import clsx from 'clsx';
import { useIsOffline } from '../../../containers/hooks/useOfflineDetector/useIsOffline';

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
  getIsOffline?: () => boolean;
  id?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

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
  getIsOffline = useIsOffline,
  ...props
}: ButtonProps) => {
  const isOffline = getIsOffline();
  const isDisabled = disabled || (isOffline && color === 'primary' && !sm);
  return (
    <button
      disabled={isDisabled}
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
