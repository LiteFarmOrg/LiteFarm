/*
 *  Copyright 2025 LiteFarm.org
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
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Main } from '../../../../Typography';
import { System } from '../../../../../types';
import {
  ArrayFields,
  ARRAYS,
  type FormFields,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import ArraySensorsForm from './ArraySensorsForm';
import styles from '../styles.module.scss';

export interface SensorsFormProps {
  system: System;
}

const SensorsForm = ({ system }: SensorsFormProps) => {
  const { t } = useTranslation();

  const { watch, trigger } = useFormContext<FormFields>();

  const arrays = watch(ARRAYS);

  useEffect(() => {
    // reset errors
    trigger(ARRAYS);
  }, []);

  return (
    <div className={styles.formsWrapper}>
      <Main className={styles.formsTitle}>{t('SENSOR.DETAIL.SENSOR_DETAILS')}</Main>

      {arrays.map((array, index) => {
        return (
          <ArraySensorsForm
            key={index}
            arrayName={array[ArrayFields.ARRAY_NAME]}
            sensorCount={array[ArrayFields.SENSOR_COUNT]}
            arrayIndex={index}
            system={system}
          />
        );
      })}
    </div>
  );
};

export default SensorsForm;
