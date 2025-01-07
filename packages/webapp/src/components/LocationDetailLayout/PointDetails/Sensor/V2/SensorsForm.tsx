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
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { Main } from '../../../../Typography';
import SensorForm from './SensorForm';
import { System } from '../../../../../types';
import {
  ArrayFields,
  ARRAYS,
  FormFields,
  SensorFields,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import styles from '../styles.module.scss';

// TODO: Finalize the default values
export const sensorDefaultValues = {
  [SensorFields.NAME]: '',
  [SensorFields.TYPES]: [],
  [SensorFields.PLACEMENT]: '',
  [SensorFields.DEPTH]: 0,
  [SensorFields.DEPTH_UNIT]: '',
  [SensorFields.MANUFUCTURER]: '',
  [SensorFields.SENSOR_ID]: '',
};

export interface SensorsFormProps {
  system: System;
}

const SensorsForm = ({ system }: SensorsFormProps) => {
  const { t } = useTranslation();

  const { control, watch, setValue } = useFormContext<FormFields>();

  const { update } = useFieldArray({
    control,
    name: ARRAYS,
  });

  const arrays = watch(ARRAYS);

  useEffect(() => {
    arrays.forEach((array, index: number) => {
      if (array.sensor_count !== array.sensors.length) {
        const newSensors = array.sensors.slice();

        if (array.sensor_count < array.sensors.length) {
          newSensors.length = array.sensor_count;
        }

        if (array.sensor_count > array.sensors.length) {
          const diff = array.sensor_count - array.sensors.length;
          for (let i = 0; i < diff; i++) {
            newSensors.push({ ...sensorDefaultValues, id: uuidv4() });
          }
        }

        setValue(`${ARRAYS}.${index}.${ArrayFields.SENSORS}`, newSensors);
      }
    });
  }, []);

  return (
    <div className={styles.formsWrapper}>
      <Main className={styles.formsTitle}>{t('SENSOR.DETAIL.SENSOR_DETAILS')}</Main>

      {arrays.map((array, index) => {
        return (
          <div className={styles.arraySensors} key={index}>
            <Main className={styles.arraySensorsArrayName}>
              {array.array_name || t('SENSOR.DETAIL.ARRAY_NUMBER', { number: index + 1 })}
            </Main>
            {array.sensors.map((sensor, sensorIndex) => {
              const namePrefix = `${ARRAYS}[${index}].${ArrayFields.SENSORS}[${sensorIndex}].`;
              const onRemove = () => {
                const newSensors = array.sensors.slice();
                newSensors.splice(sensorIndex, 1);
                update(index, { ...array, sensors: newSensors });
                setValue(`${ARRAYS}.${index}.${ArrayFields.SENSOR_COUNT}`, newSensors.length);
              };

              return (
                <SensorForm
                  key={`${index}-${sensor.id}`}
                  index={sensorIndex}
                  namePrefix={namePrefix}
                  system={system}
                  onRemove={array.sensors.length > 1 ? onRemove : undefined}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SensorsForm;
