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

import { BsFillExclamationCircleFill } from 'react-icons/bs';
import InputBaseLabel from '../InputBase/InputBaseLabel';
import NumberInputWithSelect, { NumberInputWithSelectProps } from './NumberInputWithSelect';
import styles from './styles.module.scss';

type CompositionInputsProps = Omit<
  NumberInputWithSelectProps,
  'name' | 'label' | 'value' | 'unit'
> & {
  mainLabel?: string;
  inputsInfo: { name: string; label: string }[];
  values: { [key: string]: any };
  unit?: string;
};

/**
 * Component for inputs that share the same unit.
 * Changing the unit of one input updates the units of all inputs.
 * Units that require unit system conversions are not supported.
 */
const CompositionInputs = ({
  mainLabel = '',
  inputsInfo,
  error = '',
  disabled = false,
  onChange,
  onBlur,
  values,
  unit,
  unitFieldName = '',
  ...props
}: CompositionInputsProps) => {
  return (
    <div className={styles.compositionInputsWrapper}>
      {mainLabel && <InputBaseLabel label={mainLabel} />}
      <div>
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
                unit={unit || values?.[unitFieldName]}
                unitFieldName={unitFieldName}
                value={values?.[name]}
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
    </div>
  );
};

export default CompositionInputs;
