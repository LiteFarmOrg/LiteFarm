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
import { ReactElement } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../ReactSelect';
import useReactSelectStyles from '../Unit/useReactSelectStyles';
import useNumberInput from '../NumberInput/useNumberInput';
import InputBase from '../InputBase';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import styles from './styles.module.scss';

type ReactSelectOption = { value: string; label: ReactElement | string };

export type NumberInputWithSelectProps<T extends string, U extends string> = {
  name: T;
  unitName: U;
  label: string;
  unitOptions: ReactSelectOption[];
  disabled?: boolean;
  error?: string;
  className?: string;
  values?: { [K in T | U]?: number | ReactSelectOption | undefined };
  onChange: (fieldName: T | U, value: number | ReactSelectOption) => void;
};

const REACT_SELECT_WIDTH = 44;

const NumberInputWithSelect = <T extends string, U extends string>({
  name,
  unitName,
  label,
  unitOptions,
  disabled,
  error,
  className,
  onChange,
  values = {},
}: NumberInputWithSelectProps<T, U>) => {
  const { t } = useTranslation();
  const unit = values[unitName] as ReactSelectOption;

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

  const { inputProps, update } = useNumberInput({
    onChange: (value) => onChange(name, value),
    initialValue: values[name] as number,
    max: 999999999,
  });

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
        onResetIconClick={() => update(NaN)}
        resetIconPosition="left"
        rightSection={
          <div className={styles.selectWrapper} onClick={(e) => e.preventDefault()}>
            <ReactSelect
              options={unitOptions}
              onChange={(value) => onChange(unitName, value as ReactSelectOption)}
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
