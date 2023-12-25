import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../InputField.tsx';
import type { CommonInputFieldProps } from '../InputField.tsx';

export type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
} & CommonInputFieldProps;

export default function NumberInput({ value, onChange, ...commonProps }: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();

  const [input, setInput] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const decimalSeperator = (1.1).toLocaleString(language)[1];
  const isDecimalPeriod = decimalSeperator === '.';
  const inputAsNumberString = isDecimalPeriod ? input : input.replace(decimalSeperator, '.');

  // sync parent value with local state
  if (value !== inputAsNumberString) setInput(value);

  const inputAsNumber = Number(inputAsNumberString);

  const getDisplayValue = () => {
    if (isNaN(inputAsNumber) || inputAsNumber === 0) return '';
    if (isFocused) return input;
    return inputAsNumber.toLocaleString(language);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.validity.patternMismatch) return;
    const { value } = e.target;

    setInput(value);
    onChange?.(isDecimalPeriod ? value : value.replace(decimalSeperator, '.') || '');
  };

  const pattern = isFocused
    ? `[0-9]*[${isDecimalPeriod ? '.' : `${decimalSeperator}.`}]?[0-9]*`
    : undefined;

  return (
    <InputField
      pattern={pattern}
      inputMode="numeric"
      value={getDisplayValue()}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onChange={handleChange}
      {...commonProps}
    />
  );
}
