import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField, { type CommonInputFieldProps } from '../InputField';

export type NumberInputProps = {
  value?: number | string;
  onChange?: (value: number | '') => void;
  useGrouping?: boolean;
  allowDecimal?: boolean;
  locale?: string;
} & CommonInputFieldProps;

export default function NumberInput({
  value,
  onChange,
  useGrouping = true,
  allowDecimal = true,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);
  const initialValueRef = useRef(value);
  const locale = props.locale || language;
  const decimalSeparator = getDecimalSeparator(locale);
  const inputValueAsNumber = Number(
    decimalSeparator === '.' ? inputValue : inputValue.replace(decimalSeparator, '.'),
  );

  const getDisplayValue = () => {
    if (inputValue === '' || isNaN(inputValueAsNumber)) return '';
    if (isFocused) return inputValue;
    return toLocalizedNumber(inputValueAsNumber, locale, { useGrouping });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.validity.patternMismatch) return;
    const { value } = e.target;
    setInputValue(value);
    onChange?.(
      parseFloat(decimalSeparator === '.' ? value : value.replace(decimalSeparator, '.')) || '',
    );
  };

  const getPattern = () => {
    if (!isFocused) return;
    if (!allowDecimal) return '[0-9]+';
    const decimalSeparatorRegex = `[${decimalSeparator === '.' ? '.' : `${decimalSeparator}.`}]`;
    return `[0-9]*${decimalSeparatorRegex}?[0-9]*`;
  };

  // resets input value if value prop changes to initial value
  // layout effect prevents flickering
  useLayoutEffect(() => {
    if (value === initialValueRef.current && inputValue != value)
      setInputValue(value?.toString() || '');
  }, [value]);

  return (
    <>
      <InputField
        inputMode="numeric"
        pattern={getPattern()}
        value={getDisplayValue()}
        onChange={handleChange}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        {...props}
      />
    </>
  );
}

function toLocalizedNumber(
  number: number,
  locale: Intl.LocalesArgument,
  options?: Intl.NumberFormatOptions,
) {
  try {
    return number.toLocaleString(locale, options);
  } catch (error) {
    console.error(`Invalid locale ${locale}`);
    // defaults to browsers locale
    return number.toLocaleString(undefined, options);
  }
}

function getDecimalSeparator(locale: string) {
  return toLocalizedNumber(1.1, locale)[1];
}
