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
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../../../Form/ReactSelect';
import { Main, Text } from '../../../../Typography';
import Input from '../../../../Form/Input';
import NumberInput from '../../../../Form/NumberInput';
import TextButton from '../../../../Form/Button/TextButton';
import { Location } from '../../../../../types';
import {
  ArrayFields,
  ARRAYS,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import styles from '../styles.module.scss';

interface ArrayFormProps {
  index: number;
  namePrefix: string;
  fields: Location[];
  onPlaceOnMapClick: () => void;
}

const ArrayForm = ({ index, namePrefix = '', fields = [], onPlaceOnMapClick }: ArrayFormProps) => {
  const { t } = useTranslation();

  const ARRAY_NAME = `${namePrefix}${ArrayFields.ARRAY_NAME}`;
  const SENSOR_COUNT = `${namePrefix}${ArrayFields.SENSOR_COUNT}`;
  const LATITUDE = `${namePrefix}${ArrayFields.LATITUDE}`;
  const LONGITUDE = `${namePrefix}${ArrayFields.LONGITUDE}`;
  const FIELD = `${namePrefix}${ArrayFields.FIELD}`;

  const {
    control,
    register,
    formState: { defaultValues },
  } = useFormContext();

  const defaultFormValues = defaultValues?.[ARRAYS]?.[index] || {};

  // TODO: Add validations and errors
  return (
    <div className={styles.form}>
      <Main className={styles.formTitle}>
        {t('SENSOR.DETAIL.ARRAY_NUMBER', { number: index + 1 })}
      </Main>
      {/* @ts-ignore */}
      <Input
        label={t('SENSOR.DETAIL.ARRAY_NAME')}
        placeholder={t('SENSOR.DETAIL.GIVE_ARRAY_NAME')}
        hookFormRegister={register(ARRAY_NAME)}
        optional
      />
      <NumberInput
        label={t('SENSOR.DETAIL.HOW_MANY_SENSORS')}
        defaultValue={defaultFormValues?.[SENSOR_COUNT]}
        min={1}
        name={SENSOR_COUNT}
        control={control}
        allowDecimal={false}
        showStepper
      />
      <div className={styles.latLong}>
        {/* @ts-ignore */}
        <Input
          label={t('SENSOR.DETAIL.LATITUDE')}
          placeholder={t('SENSOR.DETAIL.LATITUDE')}
          hookFormRegister={register(LATITUDE)}
        />
        {/* @ts-ignore */}
        <Input
          label={t('SENSOR.DETAIL.LONGITUDE')}
          placeholder={t('SENSOR.DETAIL.LONGITUDE')}
          hookFormRegister={register(LONGITUDE)}
        />
      </div>
      <div className={styles.latLongPicker}>
        <Text>{t('SENSOR.DETAIL.DO_NOT_KNOW_COORDINATE')}</Text>
        <TextButton onClick={onPlaceOnMapClick}>{t('SENSOR.DETAIL.PLACE_ON_MAP')}</TextButton>
      </div>
      <ReactSelect
        label={t('SENSOR.DETAIL.CONFIRM_FIELD')}
        placeholder={t('SENSOR.DETAIL.SELECT_FIELD')}
        name={FIELD}
        options={fields.map(({ location_id, name }) => ({
          value: location_id,
          label: name,
        }))}
      />
    </div>
  );
};

export default ArrayForm;
