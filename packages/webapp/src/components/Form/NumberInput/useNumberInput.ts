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

import { useTranslation } from 'react-i18next';
import { clamp, countDecimalPlaces, createNumberFormatter } from './utils';
import { ChangeEvent, ComponentPropsWithRef, useMemo, useRef, useState } from 'react';

export type NumberInputOptions = {
  /**
   * Value shown on first render.
   */
  initialValue?: number | null;
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
   * - Amount to increment or decrement.
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
  /**
   * Function called when number value of input changes.
   * @param value - Current value represented as number or NaN if input field is empty.
   */
  onChange?: (value: number) => void;
  /**
   * Function called when input is blurred.
   */
  onBlur?: () => void;
};

export default function useNumberInput({
  initialValue,
  locale: customLocale,
  decimalDigits,
  allowDecimal,
  useGrouping,
  step = 1,
  min = 0,
  max = Infinity,
  onChange,
  onBlur,
}: NumberInputOptions) {
  const {
    i18n: { language },
  } = useTranslation();

  const locale = customLocale || language;

  const formatter = useMemo(() => {
    const stepDecimalPlaces = countDecimalPlaces(step);
    const options: Intl.NumberFormatOptions = {
      useGrouping,
      minimumFractionDigits: !allowDecimal ? undefined : decimalDigits ?? stepDecimalPlaces,
      maximumFractionDigits: !allowDecimal ? 0 : decimalDigits ?? (stepDecimalPlaces || 20),
    };

    return createNumberFormatter(locale, options);
  }, [locale, useGrouping, decimalDigits, step, allowDecimal]);

  const { decimalSeparator, thousandsSeparator } = useMemo(() => {
    let separators = {
      decimalSeparator: '.',
      thousandsSeparator: ',',
    };

    // 11000.2 - random decimal number over 1000 used to extract thousands and decimal separators
    const numberParts = createNumberFormatter(locale).formatToParts(1000.2);
    for (let { type, value } of numberParts) {
      if (type === 'decimal') {
        separators.decimalSeparator = value;
      } else if (type === 'group') {
        separators.thousandsSeparator = value;
      }
    }
    return separators;
  }, [locale]);

  const [numericValue, setNumericValue] = useState<number>(initialValue ?? NaN);

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

  const pattern = useMemo(() => {
    if (!isFocused) return;
    if (!allowDecimal) return '[0-9]+';
    const decimalSeparatorRegex = `[${decimalSeparator === '.' ? '.' : `${decimalSeparator}.`}]`;
    return `[0-9]*${decimalSeparatorRegex}?[0-9]*`;
  }, [isFocused, allowDecimal, decimalSeparator]);

  const getDisplayValue = () => {
    if (isNaN(numericValue)) return '';
    if (isFocused)
      return touchedValue || formatter.format(numericValue).replaceAll(thousandsSeparator, '');
    return formatter.format(numericValue);
  };

  const handleStep = (next: number) => {
    // focus input when clicking on up/down button
    if (!isFocused) inputRef.current?.focus();
    if (touchedValue) setTouchedValue('');
    update(clamp(next, Math.max(min, 0), max));
  };

  const increment = () => handleStep((numericValue || 0) + stepValue);
  const decrement = () => handleStep((numericValue || 0) - stepValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showStepper) return;
    if (e.key === 'ArrowUp') {
      // prevent cursor from shifting to start of input
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      decrement();
    }
  };

  const inputProps: ComponentPropsWithRef<'input'> = {
    inputMode: 'decimal',
    value: getDisplayValue(),
    pattern,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: () => setIsFocused(true),
    onKeyDown: handleKeyDown,
    ref: inputRef,
  };

  return {
    numericValue,
    inputProps,
    reset: () => update(initialValue ?? NaN),
    increment,
    decrement,
    showStepper,
  };
}
