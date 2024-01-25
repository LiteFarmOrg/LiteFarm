import { ChangeEvent, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputBase, { type InputBaseProps } from '../InputBase';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import styles from './styles.module.scss';
import { countDecimalPlaces } from './utils';

export type NumberInputProps = {
  value?: number | string;
  onChange?: (valueAsNumber: number) => void;
  onBlur?: () => void;
  useGrouping?: boolean;
  allowDecimal?: boolean;
  locale?: string;
  roundToDecimalPlaces?: number;
  unit?: ReactNode;
  step?: number;
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
  roundToDecimalPlaces,
  unit,
  step,
  disabled,
  ...props
}: NumberInputProps) {
  const {
    i18n: { language },
  } = useTranslation();

  const locale = props.locale || language;

  const formatter = useMemo(() => {
    const options: Intl.NumberFormatOptions = {
      useGrouping,
      maximumFractionDigits: roundToDecimalPlaces ?? 20,
    };

    if (step) {
      const decimalPlaces = countDecimalPlaces(step);
      options.minimumFractionDigits = decimalPlaces;
      options.maximumFractionDigits = decimalPlaces;
    }

    try {
      return new Intl.NumberFormat(locale, options);
    } catch (error) {
      return new Intl.NumberFormat(undefined, options);
    }
  }, [locale, useGrouping, roundToDecimalPlaces, step]);

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

  const update = (nextNumberValue: number, nextValueString?: string) => {
    setInputValue({
      valueAsNumber: nextNumberValue,
      valueString: nextValueString ?? formatter.format(nextNumberValue),
    });
    onChange?.(valueAsNumber);
  };

  const renderStepper = () => {
    if (!step) return null;

    const handleStep = (nextValue: number) => {
      // ensure value doesn't become negative
      if (nextValue < 0) {
        if (valueAsNumber === 0) return;
        return update(0);
      }
      update(nextValue);
    };
    return (
      <Stepper
        increment={() => handleStep((valueAsNumber || 0) + step)}
        decrement={() => handleStep((valueAsNumber || 0) - step)}
      />
    );
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
      rightSection={
        <>
          {unit}
          {renderStepper()}
        </>
      }
      disabled={disabled}
      {...props}
    />
  );
}

function Stepper(props: { increment: () => void; decrement: () => void }) {
  return (
    <div className={styles.stepper}>
      <button aria-label="increase" onClick={props.increment}>
        <MdKeyboardArrowUp className={styles.stepperIcons} />
      </button>
      <button aria-label="decrease" onClick={props.decrement}>
        <MdKeyboardArrowDown className={styles.stepperIcons} />
      </button>
    </div>
  );
}
