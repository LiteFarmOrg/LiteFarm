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
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Main } from '../../../../Typography';
import TextButton from '../../../../Form/Button/TextButton';
import { ReactComponent as PlusCircleIcon } from '../../../../../assets/images/plus-circle.svg';
import ArrayForm from './ArrayForm';
import { sensorDefaultValues } from './ArraySensorsForm';
import { Location } from '../../../../../types';
import {
  ArrayFields,
  ARRAYS,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import styles from '../styles.module.scss';

export const arrayDefaultValues = {
  [ArrayFields.ARRAY_NAME]: '',
  [ArrayFields.SENSOR_COUNT]: 1,
  [ArrayFields.LATITUDE]: '',
  [ArrayFields.LONGITUDE]: '',
  [ArrayFields.FIELD]: '',
  [ArrayFields.SENSORS]: [sensorDefaultValues],
};

export interface ArraysFormProps {
  onPlaceOnMapClick: () => void;
  fields: Location[];
}

const ArraysForm = ({ onPlaceOnMapClick, fields: fieldLocations }: ArraysFormProps) => {
  const { t } = useTranslation();

  const {
    control,
    formState: { isValid },
  } = useFormContext();

  const { fields, append } = useFieldArray({
    control,
    name: ARRAYS,
  });

  return (
    <div className={styles.formsWrapper}>
      <Main className={styles.formsTitle}>{t('SENSOR.DETAIL.PLACE_YOUR_SENSORS')}</Main>

      {fields.map((field, index) => {
        const namePrefix = `${ARRAYS}[${index}].`;

        return (
          <ArrayForm
            key={field.id}
            index={index}
            namePrefix={namePrefix}
            fields={fieldLocations}
            onPlaceOnMapClick={onPlaceOnMapClick}
          />
        );
      })}

      <TextButton
        disabled={!isValid}
        onClick={() => append(arrayDefaultValues)}
        className={styles.appendFormButton}
      >
        <PlusCircleIcon />
        {t('SENSOR.DETAIL.ADD_ANOTHER_ARRAY')}
      </TextButton>
    </div>
  );
};

export default ArraysForm;
