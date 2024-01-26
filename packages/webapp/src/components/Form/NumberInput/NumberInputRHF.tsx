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

import { UseControllerProps, useController, useFormContext } from 'react-hook-form';
import NumberInput, { NumberInputProps } from './NumberInput';

type NumberInputRHFProps = {
  name: string;
  rules?: UseControllerProps['rules'];
} & NumberInputProps;

export default function NumberInputRHF({
  name,
  rules,
  onChange,
  onBlur,
  ...props
}: NumberInputRHFProps) {
  const { control, resetField } = useFormContext();
  const { field, fieldState } = useController({ name, control, rules, defaultValue: props.value });

  return (
    <NumberInput
      {...props}
      value={field.value}
      onChange={(value) => {
        field.onChange(isNaN(value) ? null : value);
        onChange?.(value);
      }}
      onBlur={() => {
        field.onBlur();
        onBlur?.();
      }}
      onCrossClick={() => resetField(name)}
      error={fieldState.error?.message}
    />
  );
}
