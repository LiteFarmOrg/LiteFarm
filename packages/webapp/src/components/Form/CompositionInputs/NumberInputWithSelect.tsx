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
import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../ReactSelect';
import useReactSelectStyles from '../Unit/useReactSelectStyles';
import useNumberInput from '../NumberInput/useNumberInput';
import InputBase from '../InputBase';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import { ReactComponent as RatioOptionIcon } from '../../../assets/images/ratio-option.svg';
import styles from './styles.module.scss';

export type Option = { value: string; label: string };

export type NumberInputWithSelectProps = {
  name: string;
  label: string;
  unitOptions?: Option[];
  disabled?: boolean;
  error?: string;
  className?: string;
  value?: number | null;
  unit: string;
  unitFieldName?: string;
  onChange: (fieldName: string, value: number | string | null) => void;
  onBlur?: () => void;
  reactSelectWidth?: number;
  reactSelectJustifyContent?: 'center' | 'flex-start' | 'flex-end';
};

const REACT_SELECT_WIDTH = 44;

const formatOptionLabel = ({ label, value }: Option): ReactNode => {
  return value === 'ratio' ? <RatioOptionIcon className={styles.ratioIcon} /> : label;
};

const NumberInputWithSelect = ({
  name,
  label,
  unitOptions = [],
  disabled,
  error,
  className,
  onChange,
  onBlur,
  value,
  unit,
  unitFieldName = '',
  reactSelectWidth = REACT_SELECT_WIDTH,
  reactSelectJustifyContent = 'center',
}: NumberInputWithSelectProps) => {
  const { t } = useTranslation();

  const reactSelectStyles = useReactSelectStyles(disabled, { reactSelectWidth });
  reactSelectStyles.control = (provided) => ({
    ...provided,
    boxShadow: 'none',
    borderRadius: 0,
    height: '46px',
    paddingLeft: disabled ? '4px' : '8px',
    fontSize: '16px',
    border: 'none',
    background: 'inherit',
  });
  reactSelectStyles.singleValue = (provided) => ({
    ...provided,
    color: 'var(--Colors-Neutral-Neutral-600, #5D697E);',
  });
  reactSelectStyles.option = (provided, state) => ({
    ...reactSelectDefaultStyles.option?.(provided, state),
    color: 'var(--Colors-Neutral-Neutral-600, #5D697E);',
  });
  reactSelectStyles.valueContainer = (provided) => ({
    ...provided,
    padding: '0',
    width: `${reactSelectWidth - 19}px`,
    display: 'flex',
    background: disabled ? 'var(--inputDisabled)' : 'inherit',
    justifyContent: reactSelectJustifyContent,
  });

  const { inputProps, update, clear, numericValue } = useNumberInput({
    onChange: (value) => onChange(name, value),
    initialValue: value,
    max: 999999999,
  });

  useEffect(() => {
    // If the value is updated from the parent, update the visible value in the input.
    const isNumericValueNumber = !isNaN(numericValue);
    const isValueNumber = typeof value === 'number';

    if ((isNumericValueNumber || isValueNumber) && numericValue !== value) {
      update(value ?? NaN);
    }
  }, [numericValue, value]);

  return (
    <div
      className={clsx(
        styles.inputWithSelectWrapper,
        error && styles.hasError,
        disabled && styles.disabled,
        className,
      )}
    >
      <InputBase
        {...inputProps}
        label={label}
        optional
        placeholder={disabled ? '' : t('common:ENTER_VALUE')}
        disabled={disabled}
        error={error}
        showErrorText={false}
        onBlur={(e) => {
          onBlur?.();
          inputProps.onBlur?.(e);
        }}
        onResetIconClick={clear}
        resetIconPosition="left"
        rightSection={
          unitOptions.length ? (
            <div className={styles.selectWrapper} onClick={(e) => e.preventDefault()}>
              <ReactSelect
                options={unitOptions}
                onChange={(option) => onChange(unitFieldName, option?.value || null)}
                value={unitOptions.find(({ value }) => value === unit)}
                styles={{ ...(reactSelectStyles as any) }}
                isDisabled={disabled}
                onBlur={onBlur}
                formatOptionLabel={formatOptionLabel}
              />
            </div>
          ) : (
            <span className={styles.selectValue}>{unit}</span>
          )
        }
      />
    </div>
  );
};

export default NumberInputWithSelect;
