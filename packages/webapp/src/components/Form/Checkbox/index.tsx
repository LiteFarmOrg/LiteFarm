/*
 *  Copyright (c) 2024 LiteFarm.org
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

import React, { PropsWithChildren, ReactChildren, ReactEventHandler } from 'react';
import styles from './checkbox.module.scss';
import clsx from 'clsx';
import { Error, Main } from '../../Typography';
import { ReactComponent as PartiallyChecked } from '../../../assets/images/partially-checked.svg';
import { ReactComponent as UncheckedEnabled } from '../../../assets/images/unchecked-enabled.svg';
import { ReactComponent as CheckedEnabled } from '../../../assets/images/checked-enabled.svg';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
  disabled?: boolean;
  classes?: {
    checkbox?: object;
    label?: object;
    container?: object;
    error?: object;
  };
  style?: object;
  hookFormRegister?: {
    ref: React.RefObject<HTMLInputElement>;
    name: string;
    onChange: ReactEventHandler;
    onBlur: ReactEventHandler;
  };
  onChange?: ReactEventHandler;
  onBlur?: ReactEventHandler;
  sm?: boolean;
  partiallyChecked?: boolean;
  tooltipContent?: string;
  errors?: string;
}

const Checkbox = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  onChange,
  onBlur,
  hookFormRegister,
  errors,
  sm,
  tooltipContent = undefined,
  partiallyChecked = false,
  ...props
}: PropsWithChildren<CheckboxProps>) => {
  const name = hookFormRegister?.name ?? props?.name;
  return (
    <label
      className={clsx(styles.container, disabled && styles.disabled)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      <input
        type={'checkbox'}
        ref={hookFormRegister?.ref}
        name={name}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          hookFormRegister?.onBlur(e);
        }}
        {...props}
        disabled={disabled}
      />
      {partiallyChecked ? (
        <PartiallyChecked className={styles.checked} />
      ) : (
        <CheckedEnabled className={styles.checked} />
      )}
      <UncheckedEnabled className={styles.unchecked} />
      <Main
        className={clsx(styles.label, sm && styles.smallLabel)}
        style={classes.label}
        tooltipContent={tooltipContent}
        data-cy="checkbox-component"
      >
        {label}
      </Main>
      {errors ? (
        <Error className={clsx(styles.error)} style={classes.error}>
          {errors}
        </Error>
      ) : null}
      {children}
    </label>
  );
};

export default Checkbox;
