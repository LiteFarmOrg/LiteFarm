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
import { BsFillExclamationCircleFill } from 'react-icons/bs';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import NumberInputWithSelect, { NumberInputWithSelectProps } from './NumberInputWithSelect';
import styles from './styles.module.scss';

type CompositionInputsProps<T extends string, U extends string> = Omit<
  NumberInputWithSelectProps<T, U>,
  'name' | 'label'
> & {
  inputsInfo: { name: T; label: string }[];
};

const CompositionInputs = <T extends string, U extends string>({
  unitName,
  unitOptions,
  inputsInfo,
  error = '',
  disabled = false,
  onChange,
  values,
}: CompositionInputsProps<T, U>) => {
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
              name={name}
              unitOptions={unitOptions}
              error={error}
              disabled={disabled}
              onChange={onChange}
              values={values}
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
