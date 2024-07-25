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

import styles from './stepper.module.scss';
import { ReactComponent as IncrementIcon } from '../../../assets/images/number-input-increment.svg';
import { ReactComponent as DecrementIcon } from '../../../assets/images/number-input-decrement.svg';
import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import clsx from 'clsx';

export type NumberInputStepperProps = {
  increment: () => void;
  decrement: () => void;
  incrementDisabled: boolean;
  decrementDisabled: boolean;
};

export default function NumberInputStepper(props: NumberInputStepperProps) {
  return (
    <div className={styles.stepper}>
      <NumberInputStepperButton
        aria-label="increase"
        className={styles.stepperBtn}
        onClick={props.increment}
        disabled={props.incrementDisabled}
      >
        <IncrementIcon className={styles.stepperIcons} />
      </NumberInputStepperButton>

      <NumberInputStepperButton
        aria-label="decrease"
        className={styles.stepperBtn}
        onClick={props.decrement}
        disabled={props.decrementDisabled}
      >
        <DecrementIcon className={styles.stepperIcons} />
      </NumberInputStepperButton>
    </div>
  );
}

export function NumberInputStepperButton(
  props: PropsWithChildren<ComponentPropsWithoutRef<'button'>>,
) {
  return (
    <button
      type="button"
      className={clsx(styles.stepperBtnUnstyled, props.className)}
      aria-label={props['aria-label']}
      tabIndex={-1}
      onMouseDown={(e) => {
        // prevent focus on button when clicked
        e.preventDefault();
      }}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
