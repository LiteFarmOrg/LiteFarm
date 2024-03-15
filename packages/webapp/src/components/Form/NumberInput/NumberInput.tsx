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

import { ChangeEvent, ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputBase, { type InputBaseProps } from '../InputBase';
import { clamp, countDecimalPlaces, isEqual } from './utils';
import NumberInputStepper from './NumberInputStepper';

export type NumberInputProps = {
  /**
   * The initial value of the input
   */
  value?: number | string;
  /**
   * function called on change with value represented as a number as the paramter.
   */
  onChange?: (value: number) => void;
  /**
   * function called when input is blurred
   */
  onBlur?: () => void;
  /**
   * Controls grouping of numbers over 1000 with the thousands separator.
   */
  useGrouping?: boolean;
  /**
   * Controls whether or not a decimal is allowed as input. If set to false, users can only enter whole numbers.
   */
  allowDecimal?: boolean;
  /**
   * The locale to use for number formatting.
   */
  locale?: string;
  /**
   * Number of decimal digits shown after blur.
   */
  decimalDigits?: number;
  /**
   * The currency symbol to display on left side of input
   */
  currencySymbol: ReactNode;
  /**
   * The unit to display on right side of input
   */
  unit?: ReactNode;
  /**
   * - Amount to increment or decrement.
   * - Renders a stepper on right side when step is greater than 0.
   * - If allowDecimal is false, then step is rounded up to the nearest whole number.
   */
  step?: number;
  /**
   * Max value of input. Only applicable if used with step
   */
  max?: number;
  /**
   * Min value of input. Only applicable if used with step
   */
  min?: number;
  disabled?: boolean;
} & InputBaseProps;

export default function NumberInput({
  value = '',
  onChange,
  onBlur,
  useGrouping = true,
  allowDecimal = true,
  decimalDigits,
  unit,
  currencySymbol,
  step = 1,
  max = Infinity,
  min = 0,
  disabled,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();

  const locale = props.locale || language;

  const formatter = useMemo(() => {
    const stepDecimalPlaces = countDecimalPlaces(step);
    const options: Intl.NumberFormatOptions = {
      useGrouping,
      minimumFractionDigits: !allowDecimal ? undefined : decimalDigits ?? stepDecimalPlaces,
      maximumFractionDigits: !allowDecimal ? 0 : decimalDigits ?? (stepDecimalPlaces || 20),
    };

    try {
      return new Intl.NumberFormat(locale, options);
    } catch (error) {
      return new Intl.NumberFormat(undefined, options);
    }
  }, [locale, useGrouping, decimalDigits, step, allowDecimal]);

  const { decimalSeparator, thousandsSeparator } = useMemo(() => {
    let separators = {
      decimalSeparator: '.',
      thousandsSeparator: ',',
    };

    // 11000.2 - random decimal number over 1000 used to extract thousands and decimal separators
    for (let { type, value } of formatter.formatToParts(11000.2)) {
      if (type === 'decimal') {
        separators.decimalSeparator = value;
      } else if (type === 'group') {
        separators.thousandsSeparator = value;
      }
    }
    return separators;
  }, [locale]);

  const propValue = typeof value === 'string' ? parseFloat(value) : value;
  const [numericValue, setNumericValue] = useState(propValue);

  // keep in sync with parent
  if (!isEqual(propValue, numericValue)) {
    setNumericValue(propValue);
    return null;
  }

  // current input value that is focused and has been touched
  const [touchedValue, setTouchedValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stepValue = allowDecimal ? step : Math.round(step);
  const showStepper = stepValue > 0;

  const update = (next: number) => {
    setNumericValue(next);
    onChange?.(next);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;
    if (validity.patternMismatch) return;
    setTouchedValue(value);
    update(parseFloat(decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.')));
  };

  const handleBlur = () => {
    if (showStepper && (numericValue < min || numericValue > max)) {
      update(clamp(numericValue, min, max));
    }
    setIsFocused(false);
    setTouchedValue('');
    onBlur?.();
  };

  const handleFocus = () => setIsFocused(true);

  const getPattern = () => {
    if (!isFocused) return;
    if (!allowDecimal) return '[0-9]+';
    const decimalSeparatorRegex = `[${decimalSeparator === '.' ? '.' : `${decimalSeparator}.`}]`;
    return `[0-9]*${decimalSeparatorRegex}?[0-9]*`;
  };

  const getDisplayValue = () => {
    if (isNaN(numericValue) || numericValue == null) return '';
    if (isFocused)
      return touchedValue || formatter.format(numericValue).replaceAll(thousandsSeparator, '');
    return formatter.format(numericValue);
  };

  const handleStep = (next: number) => {
    if (touchedValue) setTouchedValue('');
    update(clamp(next, Math.max(min, 0), max));
  };

  const increment = () => handleStep((numericValue || 0) + stepValue);
  const decrement = () => handleStep((numericValue || 0) - stepValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      // prevent cursor from shifting to start of input
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      decrement();
    }
  };

  return (
    <InputBase
      inputMode="numeric"
      pattern={getPattern()}
      value={getDisplayValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
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
              onMouseDown={(e) => {
                // prevent focus on button when clicked and shift focus on input
                e.preventDefault();
                if (!isFocused) inputRef.current?.focus();
              }}
            />
          )}
        </>
      }
      disabled={disabled}
      ref={inputRef}
      {...props}
    />
  );
}
