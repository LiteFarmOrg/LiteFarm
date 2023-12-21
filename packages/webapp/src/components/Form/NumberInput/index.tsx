import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

type NumberInputProps = {
  value: string | number;
  onChange: (value?: number) => void;
};

export default function NumberInput({ value, onChange }: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();

  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const decimalSeperators = (() => {
    const decimal = (1.1).toLocaleString(language)[1];
    return decimal === '.' ? '.' : `${decimal}.`;
  })();

  const getInputAsNumber = (input: string) =>
    parseFloat(decimalSeperators.length > 1 ? input.replace(decimalSeperators[0], '.') : input);

  const getDisplayValue = () => {
    const valueAsNumber = parseFloat(value as string);
    if (isNaN(valueAsNumber)) return '';
    if (isFocused) {
      return getInputAsNumber(input) === valueAsNumber ? input : value;
    }
    return valueAsNumber.toLocaleString(language);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.validity.patternMismatch) return;

    setInput(e.target.value);
    onChange?.(getInputAsNumber(e.target.value) || undefined);
  };
  const pattern = isFocused ? `[0-9]*[${decimalSeperators}]?[0-9]*` : undefined;

  return (
    <input
      pattern={pattern}
      inputMode="numeric"
      value={getDisplayValue()}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onChange={handleChange}
    />
  );
}
