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

import { ComponentPropsWithoutRef, ReactElement, forwardRef } from 'react';
import { type InputBaseProps } from '../';
import styles from './styles.module.scss';
import clsx from 'clsx';

type InputBaseFieldProps = Pick<InputBaseProps, 'leftSection' | 'rightSection'> & {
  crossIcon?: ReactElement;
  inputProps: ComponentPropsWithoutRef<'input'>;
};

const InputBaseField = forwardRef<HTMLInputElement, InputBaseFieldProps>((props, ref) => {
  const showCross = !!props.crossIcon;
  return (
    <div
      className={clsx(
        styles.input,
        showCross && styles.inputError,
        props.inputProps.disabled && styles.inputDisabled,
      )}
    >
      {props.leftSection && (
        <div className={styles.inputSection} data-section="left">
          {props.leftSection}
        </div>
      )}
      <input {...props.inputProps} ref={ref} />
      {(showCross || props.rightSection) && (
        <div className={styles.inputSection} data-section="right">
          {props.rightSection}
          {props.crossIcon}
        </div>
      )}
    </div>
  );
});

export default InputBaseField;
