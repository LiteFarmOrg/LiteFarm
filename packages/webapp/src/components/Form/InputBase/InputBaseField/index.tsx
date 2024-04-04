/*
 *  Copyright 2024 LiteFarm.org
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

import { ReactElement, ReactNode, forwardRef } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { HTMLInputProps } from '..';

export type InputBaseFieldProps = {
  resetIcon?: ReactElement;
  leftSection?: ReactNode;
  mainSection?: ReactNode;
  rightSection?: ReactNode;
} & HTMLInputProps;

const InputBaseField = forwardRef<HTMLInputElement, InputBaseFieldProps>((props, ref) => {
  const { resetIcon, leftSection, mainSection, rightSection, ...inputProps } = props;
  const showResetIcon = !!resetIcon;
  return (
    <div
      className={clsx(
        styles.input,
        showResetIcon && styles.inputError,
        inputProps.disabled && styles.inputDisabled,
      )}
    >
      {leftSection && (
        <div className={clsx(styles.inputSection, styles.inputSectionLeft)}>{leftSection}</div>
      )}
      {mainSection || <input {...inputProps} ref={ref} />}
      {(showResetIcon || rightSection) && (
        <div className={clsx(styles.inputSection, styles.inputSectionRight)}>
          {rightSection}
          {resetIcon}
        </div>
      )}
    </div>
  );
});

export default InputBaseField;
