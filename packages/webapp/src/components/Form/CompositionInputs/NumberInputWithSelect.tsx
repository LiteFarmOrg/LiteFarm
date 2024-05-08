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
import styles from './styles.module.scss';

export type Option = { value: string; label: ReactNode };

export const UNIT = 'unit';

export enum NPK {
  N = 'n',
  P = 'p',
  K = 'k',
}

export type NumberInputWithSelectProps = {
  name: NPK;
  label: string;
  unitOptions: Option[];
  disabled?: boolean;
  error?: string;
  className?: string;
  values?: {
    [NPK.N]?: number | null;
    [NPK.P]?: number | null;
    [NPK.K]?: number | null;
    [UNIT]?: Option;
  };
  onChange: (fieldName: string, value: number | Option | null) => void;
};

const REACT_SELECT_WIDTH = 44;

const NumberInputWithSelect = ({
  name,
  label,
  unitOptions,
  disabled,
  error,
  className,
  onChange,
  values = {},
}: NumberInputWithSelectProps) => {
  const { t } = useTranslation();
  const unit = values[UNIT];

  const reactSelectStyles = useReactSelectStyles(disabled, {
    reactSelectWidth: REACT_SELECT_WIDTH,
  });
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
    color: 'var(--Colors-Neutral-Neutral-300, #98A1B1);',
    paddingTop: unit?.value === 'ratio' ? '4px' : 0,
  });
  reactSelectStyles.option = (provided, state) => ({
    ...reactSelectDefaultStyles.option?.(provided, state),
    color: 'var(--Colors-Neutral-Neutral-300, #98A1B1);',
  });

  const { inputProps, update, clear } = useNumberInput({
    onChange: (value) => onChange(name, value),
    initialValue: values[name],
    max: 999999999,
  });

  useEffect(() => {
    // If the value is updated from the parent, update the visible value in the input.
    // Should be able to compare different types (string and number).
    if (inputProps.value != values[name]) {
      update(values[name] || NaN);
    }
  }, [inputProps.value, values[name]]);

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
        onResetIconClick={clear}
        resetIconPosition="left"
        rightSection={
          <div className={styles.selectWrapper} onClick={(e) => e.preventDefault()}>
            <ReactSelect
              options={unitOptions}
              onChange={(value) => onChange(UNIT, value || null)}
              value={unit}
              styles={{ ...(reactSelectStyles as any) }}
              isDisabled={disabled}
            />
          </div>
        }
      />
    </div>
  );
};

export default NumberInputWithSelect;
