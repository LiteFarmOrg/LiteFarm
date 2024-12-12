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

import InputBase from '../../InputBase';
import { NumberInputStepperButton } from '../../NumberInput/NumberInputStepper';
import useNumberInput from '../../NumberInput/useNumberInput';
import styles from './styles.module.scss';
import { ReactComponent as PlusSquareIcon } from '../../../../assets/images/plus-square.svg';
import { ReactComponent as MinusSquareIcon } from '../../../../assets/images/minus-square.svg';

type SexDetailsCountInputProps = {
  label: string;
  initialCount: number;
  max: number;
  onCountChange?: (count: number) => void;
};

export default function SexDetailsCountInput({
  label,
  max,
  onCountChange,
  initialCount,
}: SexDetailsCountInputProps) {
  const { increment, decrement, inputProps, numericValue } = useNumberInput({
    initialValue: initialCount,
    max,
    clampOnBlur: false,
    useGrouping: false,
    allowDecimal: false,
    onChange: (num) => onCountChange?.(isNaN(num) ? 0 : num),
  });

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <InputBase
        className={styles.countInput}
        showResetIcon={false}
        leftSection={
          <NumberInputStepperButton
            onClick={decrement}
            disabled={numericValue === 0}
            className={styles.stepperBtn}
          >
            <MinusSquareIcon />
          </NumberInputStepperButton>
        }
        rightSection={
          <NumberInputStepperButton
            onClick={increment}
            disabled={numericValue === max}
            className={styles.stepperBtn}
          >
            <PlusSquareIcon />
          </NumberInputStepperButton>
        }
        {...inputProps}
      />
    </div>
  );
}
