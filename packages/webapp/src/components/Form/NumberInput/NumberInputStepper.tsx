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
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { ReactComponent as IncrementIcon } from '../../../assets/images/number-input-increment.svg';
import { ReactComponent as DecrementIcon } from '../../../assets/images/number-input-decrement.svg';

export type NumberInputStepperProps = {
  increment: () => void;
  decrement: () => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  incrementDisabled: boolean;
  decrementDisabled: boolean;
};

export default function NumberInputStepper(props: NumberInputStepperProps) {
  return (
    <div className={styles.stepper}>
      <button
        className={styles.stepperBtn}
        aria-label="increase"
        tabIndex={-1}
        onMouseDown={props.onMouseDown}
        onClick={props.increment}
        disabled={props.incrementDisabled}
      >
        <IncrementIcon className={styles.stepperIcons} />
      </button>
      <button
        className={styles.stepperBtn}
        aria-label="decrease"
        tabIndex={-1}
        onMouseDown={props.onMouseDown}
        onClick={props.decrement}
        disabled={props.decrementDisabled}
      >
        <DecrementIcon className={styles.stepperIcons} />
      </button>
    </div>
  );
}
