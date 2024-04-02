/*
 *  Copyright 2022-2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { ReactNode } from 'react';
import styles from './button.module.scss';
import clsx from 'clsx';

type ButtonProps = {
  color?: 'primary' | 'secondary' | 'secondary-2' | 'secondary-cta' | 'warning' | 'error' | 'none';
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
