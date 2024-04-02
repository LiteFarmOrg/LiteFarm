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

import { ReactNode } from 'react';
import InputBase, { type InputBaseSharedProps } from '../InputBase';
import NumberInputStepper from './NumberInputStepper';
import useNumberInput, { NumberInputOptions } from './useNumberInput';
import { UseControllerProps, useController } from 'react-hook-form';

export type NumberInputProps = NumberInputOptions & {
  /**
   * The currency symbol to display on left side of input
   */
  currencySymbol?: ReactNode;
  /**
   * The unit to display on right side of input
   */
  unit?: ReactNode;
  /**
   * Controls visibility of stepper.
   */
  showStepper?: boolean;
} & InputBaseSharedProps;

type RhfProps = {
  name: string;
  control: UseControllerProps['control'];
  rules?: UseControllerProps['rules'];
};

export default function NumberInput({
  initialValue,
  locale,
  useGrouping = true,
  allowDecimal = true,
  decimalDigits,
  unit,
  currencySymbol,
  step = 1,
  max = Infinity,
  min = 0,
  showStepper = false,
  name,
  control,
  rules,
  onChange,
  onBlur,
  ...props
}: NumberInputProps & RhfProps) {
  const { field, fieldState } = useController({ name, control, rules, defaultValue: initialValue });
  const { inputProps, reset, numericValue, increment, decrement } = useNumberInput({
    initialValue,
    allowDecimal,
    decimalDigits,
    locale,
    useGrouping,
    step,
    min,
    max,
    onChange: (value) => {
      field.onChange(isNaN(value) ? null : value);
      onChange?.(value);
    },
    onBlur: () => {
      field.onBlur();
      onBlur?.();
    },
  });

  return (
    <InputBase
      {...props}
      {...inputProps}
      error={fieldState.error?.message}
      onResetIconClick={reset}
      leftSection={currencySymbol}
      rightSection={
        <>
          {unit}
          {showStepper && (
            <NumberInputStepper
              increment={increment}
              decrement={decrement}
              incrementDisabled={numericValue === max}
              decrementDisabled={numericValue === Math.max(min, 0)}
            />
          )}
        </>
      }
    />
  );
}
