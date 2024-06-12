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

type CompositionInputsProps = Omit<
  NumberInputWithSelectProps,
  'name' | 'label' | 'value' | 'unit'
> & {
  inputsInfo: { name: string; label: string }[];
  values: { [key: string]: any };
  unitFieldName: string;
};

const CompositionInputs = ({
  inputsInfo,
  error = '',
  disabled = false,
  onChange,
  onBlur,
  values,
  unitFieldName,
  reactSelectJustifyContent,
  ...props
}: CompositionInputsProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <InputBaseLabel label={t('ADD_PRODUCT.COMPOSITION')} />
      <div className={styles.inputsWrapper}>
        {inputsInfo.map(({ name, label }) => {
          return (
            <NumberInputWithSelect
              {...props}
              key={label}
              label={label}
              name={name}
              error={error}
              disabled={disabled}
              onChange={onChange}
              onBlur={onBlur}
              unit={values?.[unitFieldName]!}
              unitFieldName={unitFieldName}
              value={values?.[name]}
              reactSelectJustifyContent={
                reactSelectJustifyContent || (disabled ? 'flex-end' : 'flex-start')
              }
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
