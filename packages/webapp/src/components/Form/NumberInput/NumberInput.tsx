import { ChangeEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField, { type CommonInputFieldProps } from '../InputField';

export type NumberInputProps = {
  value?: number | string;
  onChange?: (valueAsNumber: number) => void;
  onBlur?: () => void;
  useGrouping?: boolean;
  allowDecimal?: boolean;
  locale?: string;
  roundToDecimalPlaces?: number;
} & CommonInputFieldProps;

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
  roundToDecimalPlaces,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();

  const locale = props.locale || language;

  const formatter = useMemo(() => {
    const options = {
      useGrouping,
      maximumFractionDigits: roundToDecimalPlaces ?? 20,
    };
    try {
      return new Intl.NumberFormat(locale, options);
    } catch (error) {
      return new Intl.NumberFormat(undefined, options);
    }
  }, [locale, useGrouping, roundToDecimalPlaces]);

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

  /*
  - resets state if value prop changes to initial value
  - layout effect prevents flickering
  */
  useLayoutEffect(() => {
    if (propValue === initialValueRef.current && valueString != propValue)
      setInputValue(initializeInputValue(propValue, formatter));
  }, [propValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;
    if (validity.patternMismatch) return;
    const number = parseFloat(
      decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.'),
    );
    setInputValue({
      valueString: value,
      valueAsNumber: number,
    });
    setIsEditedAfterFocus(true);
    onChange?.(number);
  };
  const handleBlur = () => {
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
    <InputField
      inputMode="numeric"
      pattern={getPattern()}
      value={getDisplayValue()}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  );
}
