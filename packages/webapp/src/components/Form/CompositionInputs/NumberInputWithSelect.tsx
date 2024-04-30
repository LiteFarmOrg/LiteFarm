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
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import NumberInput from '../NumberInput';
import ReactSelect from '../ReactSelect';
import useReactSelectStyles from '../Unit/useReactSelectStyles';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import styles from './styles.module.scss';

type NumberInputWithSelectProps = {
  control: any;
  name: string;
  unitName: string;
  label: string;
  unitOptions: { label: any; value: string }[];
  initialValue?: number;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
};

const NumberInputWithSelect = ({
  control,
  name,
  unitName,
  label,
  unitOptions,
  initialValue,
  disabled,
  hasError,
  className,
}: NumberInputWithSelectProps) => {
  const { t } = useTranslation();
  const reactSelectStyles = useReactSelectStyles(disabled, {
    // when modifying this value, padding-right of NumberInput in the scss file should be adjusted together.
    reactSelectWidth: 44,
  });
  reactSelectStyles.control = (provided) => ({
    ...provided,
    backgroundColor: '#F7F8FA',
    boxShadow: 'none',
    boxSizing: 'border-box',
    borderRadius: '0 4px 4px 0',
    minHeight: '46px',
    paddingLeft: disabled ? '4px' : '8px',
    fontSize: '16px',
    border: 'none',
  });
  reactSelectStyles.singleValue = (provided) => ({
    ...provided,
    color: 'var(--Colors-Neutral-Neutral-600)',
    position: 'absolute',
    left: 0,
    top: 0,
  });

  return (
    <div className={className}>
      <InputBaseLabel label={label} optional />
      <div
        className={clsx(
          styles.inputWithSelectWrapper,
          hasError && styles.hasError,
          disabled && styles.disabled,
        )}
      >
        <NumberInput
          initialValue={initialValue}
          name={name}
          control={control}
          optional={true}
          placeholder={disabled ? '' : t('common:ENTER_VALUE')}
          disabled={disabled}
        />
        <Controller
          control={control}
          name={unitName}
          render={({ field: { onChange, value } }) => (
            <ReactSelect
              options={unitOptions}
              onChange={onChange}
              value={value}
              styles={{ ...(reactSelectStyles as any) }}
              style={{ position: 'absolute', top: '1px', right: '1px' }}
              isDisabled={disabled}
            />
          )}
        />
      </div>
    </div>
  );
};

export default NumberInputWithSelect;
