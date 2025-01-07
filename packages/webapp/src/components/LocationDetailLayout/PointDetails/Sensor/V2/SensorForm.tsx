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
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Main } from '../../../../Typography';
import Unit from '../../../../Form/Unit';
import { container_planting_depth } from '../../../../../util/convert-units/unit';
import Input from '../../../../Form/Input';
import ReactSelect from '../../../../Form/ReactSelect';
import SmallButton from '../../../../Form/Button/SmallButton';
import { System } from '../../../../../types';
import { SensorFields } from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import styles from '../styles.module.scss';

interface SensorFormProps {
  index: number;
  namePrefix?: string;
  system: System;
  onRemove?: () => void;
}

const SensorForm = ({ index, namePrefix = '', system, onRemove }: SensorFormProps) => {
  const { t } = useTranslation();

  const NAME = `${namePrefix}${SensorFields.NAME}`;
  const TYPES = `${namePrefix}${SensorFields.TYPES}`;
  const PLACEMENT = `${namePrefix}${SensorFields.PLACEMENT}`;
  const DEPTH = `${namePrefix}${SensorFields.DEPTH}`;
  const DEPTH_UNIT = `${namePrefix}${SensorFields.DEPTH_UNIT}`;
  const MANUFUCTURER = `${namePrefix}${SensorFields.MANUFUCTURER}`;
  const SENSOR_ID = `${namePrefix}${SensorFields.SENSOR_ID}`;

  const { control, watch, register, getValues, setValue } = useFormContext();

  // TODO: Add errors
  return (
    <div className={clsx(styles.form, styles.sensor)}>
      <div className={styles.formHeader}>
        <Main className={styles.formTitle}>
          {t('SENSOR.DETAIL.SENSOR_NUMBER', { number: index + 1 })}
        </Main>
        {onRemove && <SmallButton variant="remove" onClick={onRemove} />}
      </div>
      {/* @ts-ignore */}
      <Input
        label={t('SENSOR.DETAIL.SENSOR_NAME')}
        placeholder={t('SENSOR.DETAIL.GIVE_SENSOR_NAME')}
        hookFormRegister={register(NAME)}
      />
      <ReactSelect
        isMulti={true}
        label={t('SENSOR.DETAIL.SENSOR_TYPE')}
        placeholder={t('SENSOR.DETAIL.SELECT_SENSOR_TYPE')}
        name={TYPES}
      />
      <div className={styles.installation}>
        <ReactSelect
          isMulti={true}
          label={t('SENSOR.DETAIL.SENSOR_PLACEMENT')}
          placeholder={t('SENSOR.DETAIL.SELECT_SENSOR_PLACEMENT')}
          name={PLACEMENT}
        />
        {/* @ts-ignore */}
        <Unit
          register={register}
          displayUnitName={DEPTH_UNIT}
          label={t('SENSOR.DETAIL.INSTALLATION_DEPTH')}
          placeholder={t('SENSOR.DETAIL.DEPTH')}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          name={DEPTH}
          unitType={container_planting_depth}
          max={10000}
          system={system}
          control={control}
        />
      </div>
      <ReactSelect
        label={t('SENSOR.DETAIL.MANUFACTURER')}
        placeholder={t('SENSOR.DETAIL.ENTER_MANUFACTURER')}
        name={MANUFUCTURER}
      />
      {/* @ts-ignore */}
      <Input
        label={t('SENSOR.DETAIL.SENSOR_ID')}
        placeholder={t('SENSOR.DETAIL.ENTER_SENSOR_ID')}
        optional={true}
        hookFormRegister={register(SENSOR_ID)}
      />
    </div>
  );
};

export default SensorForm;
