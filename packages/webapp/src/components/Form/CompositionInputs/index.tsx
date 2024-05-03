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

import { useTranslation } from 'react-i18next';
import { Control } from 'react-hook-form';
import type { FieldValues, Path, PathValue, UseFormGetValues } from 'react-hook-form';
import { BsFillExclamationCircleFill } from 'react-icons/bs';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import NumberInputWithSelect from './NumberInputWithSelect';
import styles from './styles.module.scss';

type CompositionInputsProps<T extends FieldValues> = {
  control: Control<T>;
  getValues: UseFormGetValues<T>;
  unitName: string;
  unitOptions: PathValue<T, Path<T>>[];
  inputsInfo: { name: string; label: string }[];
  error?: string;
  disabled?: boolean;
};

const CompositionInputs = <T extends FieldValues>({
  control,
  getValues,
  unitName,
  unitOptions,
  inputsInfo,
  error = '',
  disabled = false,
}: CompositionInputsProps<T>) => {
  const { t } = useTranslation();

  return (
    <div>
      <InputBaseLabel label={t('ADD_PRODUCT.COMPOSITION')} />
      <div className={styles.inputsWrapper}>
        {inputsInfo.map(({ name, label }) => {
          return (
            <NumberInputWithSelect
              key={label}
              label={label}
              unitName={unitName}
              name={name as Path<T>}
              control={control}
              unitOptions={unitOptions}
              hasError={!!error}
              disabled={disabled}
              getValues={getValues}
            />
          );
        })}
      </div>
      {error && (
        <div className={styles.error}>
          <BsFillExclamationCircleFill className={styles.errorIcon} />
          <span className={styles.errorMessage}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default CompositionInputs;
