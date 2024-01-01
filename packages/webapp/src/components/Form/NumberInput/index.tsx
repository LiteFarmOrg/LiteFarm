import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField, { type CommonInputFieldProps } from '../InputField';

export type NumberInputProps = {
  value?: number | string;
  onChange?: (value: number | '') => void;
  useGrouping?: boolean;
} & CommonInputFieldProps;

export default function NumberInput({
  value,
  onChange,
  useGrouping = true,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);
  const initialValueRef = useRef(value);

  const decimalSeperator = (1.1).toLocaleString(language)[1];
  const inputValueAsNumber = Number(
    decimalSeperator === '.' ? inputValue : inputValue.replace(decimalSeperator, '.'),
  );

  const getDisplayValue = () => {
    if (inputValue === '' || isNaN(inputValueAsNumber)) return '';
    if (isFocused) return inputValue;
    return inputValueAsNumber.toLocaleString(language, { useGrouping });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.validity.patternMismatch) return;
    const { value } = e.target;
    setInputValue(value);
    onChange?.(
      parseFloat(decimalSeperator === '.' ? value : value.replace(decimalSeperator, '.')) || '',
    );
  };

  const pattern = isFocused
    ? `[0-9]*[${decimalSeperator === '.' ? '.' : `${decimalSeperator}.`}]?[0-9]*`
    : undefined;

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
        pattern={pattern}
        value={getDisplayValue()}
        onChange={handleChange}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        {...props}
      />
    </>
  );
}
