import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField, { type CommonInputFieldProps } from '../InputField';

export type NumberInputProps = {
  value?: number | string;
  onChange?: (propValue: number | '') => void;
  useGrouping?: boolean;
  allowDecimal?: boolean;
  locale?: string;
} & CommonInputFieldProps;

export default function NumberInput({
  value: propValue = '',
  onChange,
  useGrouping = true,
  allowDecimal = true,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();
  const locale = props.locale || language;
  const [{ valueString, valueAsNumber }, setInputValue] = useState(
    initializeInputValue(propValue, locale),
  );
  const [isFocused, setIsFocused] = useState(false);
  const initialValueRef = useRef(propValue);
  const decimalSeparator = getDecimalSeparator(locale);

  /*
  - resets state if value prop changes to initial value
  - layout effect prevents flickering
  */
  useLayoutEffect(() => {
    if (propValue === initialValueRef.current && valueString != propValue)
      setInputValue(initializeInputValue(propValue, locale));
  }, [propValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;
    if (validity.patternMismatch) return;
    const asNumber = parseFloat(
      decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.'),
    );
    setInputValue({
      valueString: value,
      valueAsNumber: asNumber,
    });
    onChange?.(asNumber);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue({
      valueString: toLocalizedNumString(valueAsNumber, locale, { useGrouping }),
      valueAsNumber,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue({
      valueString: toLocalizedNumString(valueAsNumber, locale, { useGrouping: false }),
      valueAsNumber,
    });
  };

  const getPattern = () => {
    if (!isFocused) return;
    if (!allowDecimal) return '[0-9]+';
    const decimalSeparatorRegex = `[${decimalSeparator === '.' ? '.' : `${decimalSeparator}.`}]`;
    return `[0-9]*${decimalSeparatorRegex}?[0-9]*`;
  };

  return (
    <InputField
      inputMode="numeric"
      pattern={getPattern()}
      value={valueString}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  );
}

function toLocalizedNumString(
  number: number,
  locale: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  if (!Number.isFinite(number)) return '';
  try {
    return number.toLocaleString(locale, options);
  } catch (error) {
    console.error(`Invalid locale ${locale}`);
    // defaults to browsers locale
    return number.toLocaleString(undefined, options);
  }
}

function getDecimalSeparator(locale: string) {
  return toLocalizedNumString(1.1, locale)[1];
}

function initializeInputValue(initialValue: NumberInputProps['value'] = '', locale: string) {
  return () => {
    const valueAsNumber = parseFloat(initialValue.toString());
    const valueString = isNaN(valueAsNumber) ? '' : toLocalizedNumString(valueAsNumber, locale);
    return {
      valueString,
      valueAsNumber,
    };
  };
}
