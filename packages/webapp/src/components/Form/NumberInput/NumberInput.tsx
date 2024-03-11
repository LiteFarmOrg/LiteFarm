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
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import styles from './styles.module.scss';
import { clamp, countDecimalPlaces } from './utils';

export type NumberInputProps = {
  /**
   * The initial value of the input
   */
  value?: number | string;
  /**
   * function called on change with value represented as a number as the paramter.
   */
  onChange?: (valueAsNumber: number) => void;
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
   * Amount to step up or down. Renders a stepper on right side with up and down buttons when step is greater than 0.
   * If allowDecimal is false, then step is rounded down to the nearest whole number.
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

const initializeInputValue =
  (initialValue: NumberInputProps['value'] = '', formatter: Intl.NumberFormat) =>
  () => {
    const valueAsNumber = parseFloat(initialValue.toString());
    const valueString = !Number.isFinite(valueAsNumber) ? '' : formatter.format(valueAsNumber);
    return {
      valueString,
      valueAsNumber,
    };
  };

export default function NumberInput({
  value: propValue = '',
  onChange,
  onBlur,
  useGrouping = true,
  allowDecimal = true,
  decimalDigits,
  unit,
  currencySymbol,
  step,
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

  const [{ valueString, valueAsNumber }, setInputValue] = useState(
    initializeInputValue(propValue, formatter),
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isEditedAfterFocus, setIsEditedAfterFocus] = useState(false);
  const initialValueRef = useRef(propValue);
  const showStepper = typeof step === 'number' && step > 0;

  /*
  - resets state if value prop changes to initial value
  - layout effect prevents flickering
  */
  useLayoutEffect(() => {
    if (propValue === initialValueRef.current && valueString != propValue)
      setInputValue(initializeInputValue(propValue, formatter));
  }, [propValue]);

  const update = (nextNumberValue: number, nextValueString?: string) => {
    setInputValue({
      valueAsNumber: nextNumberValue,
      valueString: nextValueString ?? formatter.format(nextNumberValue),
    });
    onChange?.(nextNumberValue);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;
    if (validity.patternMismatch) return;
    const number = parseFloat(
      decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.'),
    );
    update(number, value);
    setIsEditedAfterFocus(true);
  };

  const handleBlur = () => {
    if (showStepper && (valueAsNumber < min || valueAsNumber > max)) {
      update(clamp(valueAsNumber, min, max));
    }
    setIsFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsEditedAfterFocus(false);
  };

  const getPattern = () => {
    if (!isFocused) return;
    if (!allowDecimal) return '[0-9]+';
    const decimalSeparatorRegex = `[${decimalSeparator === '.' ? '.' : `${decimalSeparator}.`}]`;
    return `[0-9]*${decimalSeparatorRegex}?[0-9]*`;
  };

  const getDisplayValue = () => {
    if (isNaN(valueAsNumber)) return '';
    if (isFocused) {
      if (isEditedAfterFocus) return valueString;
      return useGrouping && valueAsNumber >= 1000
        ? formatter.format(valueAsNumber).replaceAll(thousandsSeparator, '')
        : formatter.format(valueAsNumber);
    }
    return formatter.format(valueAsNumber);
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
          {showStepper &&
            (() => {
              // ensure value doesn't become negative
              const nonNegativeMin = Math.max(min, 0);
              const stepValue = allowDecimal ? step : Math.floor(step);
              let value = valueAsNumber || 0;
              return (
                <Stepper
                  increment={() => update(clamp(value + stepValue, nonNegativeMin, max))}
                  decrement={() => update(clamp(value - stepValue, nonNegativeMin, max))}
                  incrementDisabled={valueAsNumber === max}
                  decrementDisabled={valueAsNumber === nonNegativeMin}
                />
              );
            })()}
        </>
      }
      disabled={disabled}
      {...props}
    />
  );
}

function Stepper(props: {
  increment: () => void;
  decrement: () => void;
  incrementDisabled: boolean;
  decrementDisabled: boolean;
}) {
  return (
    <div className={styles.stepper}>
      <button aria-label="increase" onClick={props.increment} disabled={props.incrementDisabled}>
        <MdKeyboardArrowUp className={styles.stepperIcons} />
      </button>
      <button aria-label="decrease" onClick={props.decrement} disabled={props.decrementDisabled}>
        <MdKeyboardArrowDown className={styles.stepperIcons} />
      </button>
    </div>
  );
}
