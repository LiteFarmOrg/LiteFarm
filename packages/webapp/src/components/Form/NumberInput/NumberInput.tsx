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

import { ChangeEvent, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputBase, { type InputBaseProps } from '../InputBase';
import { clamp, countDecimalPlaces } from './utils';
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
  value: propValue = '',
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
    const stepDecimalPlaces = countDecimalPlaces(step || 1);

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
    for (let { type, value } of formatter.formatToParts(11000.2)) {
      if (type === 'decimal') {
        separators.decimalSeparator = value;
      } else if (type === 'group') {
        separators.thousandsSeparator = value;
      }
    }
    return separators;
  }, [locale]);

  const [numericValue, setNumericValue] = useState(() => parseFloat(propValue as string));
  const [isFocused, setIsFocused] = useState(false);

  // current value in focused input that has been touched
  const [touchedValue, setTouchedValue] = useState<string | null>(null);
  const initialValueRef = useRef(propValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const stepValue = allowDecimal ? step : Math.round(step);
  const showStepper = stepValue > 0;

  /*
  - resets state if value prop changes to initial value
  - layout effect prevents flickering
  */
  useLayoutEffect(() => {
    const propValueNum = parseFloat(propValue as string);
    if (propValue === initialValueRef.current && numericValue != propValueNum)
      setNumericValue(propValueNum);
  }, [propValue]);

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
    setTouchedValue(null);
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
    if (isNaN(numericValue)) return '';
    if (isFocused)
      return touchedValue ?? formatter.format(numericValue).replaceAll(thousandsSeparator, '');
    return formatter.format(numericValue);
  };

  return (
    <InputBase
      inputMode="numeric"
      pattern={getPattern()}
      value={getDisplayValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      leftSection={currencySymbol}
      rightSection={
        <>
          {unit}
          {showStepper && (
            <NumberInputStepper
              increment={() =>
                update(clamp((numericValue || 0) + stepValue, Math.max(min, 0), max))
              }
              decrement={() =>
                update(clamp((numericValue || 0) - stepValue, Math.max(min, 0), max))
              }
              incrementDisabled={numericValue === max}
              decrementDisabled={numericValue === Math.max(min, 0)}
              onMouseDown={(e) => {
                // prevent focus on button when clicked and shift focus on input
                e.preventDefault();
                if (document.activeElement !== inputRef.current) inputRef.current?.focus();
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
