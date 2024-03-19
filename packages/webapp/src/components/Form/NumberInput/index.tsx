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
import InputBase, { type InputBaseProps } from '../InputBase';
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
  disabled?: boolean;
} & Omit<InputBaseProps, 'onCrossClick' | 'leftSection' | 'rightSection'>;

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
  name,
  control,
  rules,
  onChange,
  onBlur,
  ...props
}: NumberInputProps & RhfProps) {
  const { field, fieldState } = useController({ name, control, rules, defaultValue: initialValue });
  const { inputProps, stepperProps, reset } = useNumberInput({
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
      inputMode="decimal"
      error={fieldState.error?.message}
      onCrossClick={reset}
      leftSection={currencySymbol}
      rightSection={
        <>
          {unit}
          <NumberInputStepper {...stepperProps} />
        </>
      }
    />
  );
}
