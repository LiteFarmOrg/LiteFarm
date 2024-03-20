/*
 *  Copyright 2023 LiteFarm.org
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
import { MouseEventHandler, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './button.module.scss';

type ButtonProps = {
  children?: ReactNode | string;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler;
  type?: 'button' | 'submit' | 'reset';
  inputRef?: any;
};

const TextButton = ({
  children = 'Button',
  disabled = false,
  className,
  onClick,
  type = 'button',
  inputRef,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={clsx(styles.textButton, className)}
      onClick={onClick}
      type={type}
      ref={inputRef}
      {...props}
    >
      {children}
    </button>
  );
};

export default TextButton;
