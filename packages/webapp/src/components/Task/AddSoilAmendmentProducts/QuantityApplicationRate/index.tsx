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

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import styles from './styles.module.scss';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactComponent as SwapIcon } from '../../../../assets/images/swap.svg';
import TextButton from '../../../Form/Button/TextButton';
import Switch from '../../../Form/Switch';
import Unit from '../../../Form/Unit';
import NumberInput from '../../../Form/NumberInput';
import {
  location_area,
  soilAmounts,
  soilAmountsVolume,
  applicationRateWeight,
  applicationRateVolume,
} from '../../../../util/convert-units/unit';
import { TASK_PRODUCT_FIELD_NAMES } from '../types';
import { AreaApplicationSummary } from './AreaApplicationSummary';
import { useQuantityApplicationRate } from './useQuantityApplicationRate';

const SOIL_AMENDMENT_UNITS = {
  WEIGHT: {
    units: soilAmounts, // original
  },
  VOLUME: {
    units: soilAmountsVolume,
  },
  APPLICATION_RATE_WEIGHT: {
    units: applicationRateWeight,
  },
  APPLICATION_RATE_VOLUME: {
    units: applicationRateVolume,
  },
};

export interface Location {
  type: string;
  total_area: number;
  total_area_unit: 'm2' | 'ha' | 'ft2' | 'ac';
}

export type QuantityApplicationRateProps = {
  productId: number | string;
  isReadOnly: boolean;
  system: 'metric' | 'imperial';
  locations: Location[];
  namePrefix?: string;
};

const QuantityApplicationRate = ({
  productId,
  isReadOnly,
  system, // measurementSelector
  locations,
  namePrefix = '',
}: QuantityApplicationRateProps) => {
  const { t } = useTranslation();

  const WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.WEIGHT}`;
  const VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.VOLUME}`;
  const WEIGHT_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT}`;
  const VOLUME_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT}`;
  const PERCENT_OF_LOCATION_AMENDED = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED}`;
  const TOTAL_AREA_AMENDED = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED}`;
  const TOTAL_AREA_AMENDED_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT}`;
  const APPLICATION_RATE_WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT}`;
  const APPLICATION_RATE_VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME}`;
  const APPLICATION_RATE_WEIGHT_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT}`;
  const APPLICATION_RATE_VOLUME_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT}`;

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  let total_area, total_area_unit, type;
  const locationCount = locations.length;
  if (locationCount === 1) {
    [{ total_area, total_area_unit, type }] = locations;
  } else {
    total_area = locations.reduce((acc, { total_area }) => acc + total_area, 0);
  }

  const { control, getValues, setValue, register, watch, formState } = useFormContext();

  /* Control of relationship between quantity, area, and application rate */
  const {
    updateApplicationRate,
    updateQuantity,
    onPercentLocationChange,
    isWeight,
    toggleMeasure,
    previewStringValue,
    previewStringUnit,
  } = useQuantityApplicationRate({
    total_area,
    total_area_unit,
    system,
    namePrefix,
  });

  const percent_of_location = watch(PERCENT_OF_LOCATION_AMENDED);

  /* Label for weight/volume switch */
  const formatLabel = (labelKey: string, shouldBeBold: boolean) => {
    // t('ADD_TASK.SOIL_AMENDMENT_VIEW.WEIGHT')
    // t('ADD_TASK.SOIL_AMENDMENT_VIEW.VOLUME')
    const label = t(labelKey);
    return shouldBeBold ? (
      <span className={styles.switchLabel}>
        <b>{label}</b>
      </span>
    ) : (
      <span className={styles.switchLabel}>{label}</span>
    );
  };

  return (
    <div className={styles.container}>
      <Switch
        leftLabel={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.WEIGHT', isWeight)}
        label={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.VOLUME', !isWeight)}
        isToggleVariant
        onChange={toggleMeasure}
        checked={!isWeight}
        disabled={isReadOnly}
      />
      <div className={styles.applicationRateCard}>
        <div>
          {/* @ts-ignore */}
          <Unit
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.QUANTITY')}
            data-cy="soilAmendment-quantity"
            register={register}
            name={isWeight ? WEIGHT : VOLUME}
            displayUnitName={isWeight ? WEIGHT_UNIT : VOLUME_UNIT}
            unitType={SOIL_AMENDMENT_UNITS[isWeight ? 'WEIGHT' : 'VOLUME'].units}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            mode={'onChange'}
            onInputChange={updateApplicationRate}
            onChangeUnitOption={updateApplicationRate}
            disabled={isReadOnly}
            required
            key={isWeight ? 'weight' : 'volume'}
          />
          <AreaApplicationSummary
            locationArea={previewStringValue!}
            locationAreaUnit={previewStringUnit!}
            percentOfArea={Math.min(percent_of_location || 100, 100)}
            locationType={
              type && t(`FARM_MAP.MAP_FILTER.${type.toUpperCase()}`).toLocaleLowerCase()
            }
            locationCount={locationCount}
          />
        </div>
        <div className={clsx(styles.border, styles.advancedSection, isExpanded && styles.expanded)}>
          <TextButton onClick={toggleExpanded} className={clsx(styles.advancedTitle)}>
            <span>{t('ADD_TASK.SOIL_AMENDMENT_VIEW.ADVANCED')}</span>
            <KeyboardArrowDownIcon className={styles.expandIcon} />
          </TextButton>

          <Collapse id={`application_rate-${productId}`} in={isExpanded} timeout="auto">
            <div className={styles.sectionBody}>
              <div className={styles.locationSection}>
                <NumberInput
                  name={PERCENT_OF_LOCATION_AMENDED}
                  control={control}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PERECENT_TO_AMEND')}
                  min={0.0001}
                  max={100}
                  rules={{ required: t('common:REQUIRED') }}
                  onChange={onPercentLocationChange}
                  disabled={isReadOnly}
                  defaultValue={formState.defaultValues?.[PERCENT_OF_LOCATION_AMENDED] || 100}
                />
                <SwapIcon />
                {/* @ts-ignore */}
                <Unit
                  register={register}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.TOTAL_AREA')}
                  name={TOTAL_AREA_AMENDED}
                  displayUnitName={TOTAL_AREA_AMENDED_UNIT}
                  unitType={location_area}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  mode={'onChange'}
                  defaultValue={formState.defaultValues?.[TOTAL_AREA_AMENDED] || total_area}
                  disabled
                  required
                />
              </div>
              {/* @ts-ignore */}
              <Unit
                label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.APPLICATION_RATE')}
                register={register}
                name={isWeight ? APPLICATION_RATE_WEIGHT : APPLICATION_RATE_VOLUME}
                displayUnitName={
                  isWeight ? APPLICATION_RATE_WEIGHT_UNIT : APPLICATION_RATE_VOLUME_UNIT
                }
                unitType={
                  SOIL_AMENDMENT_UNITS[
                    isWeight ? 'APPLICATION_RATE_WEIGHT' : 'APPLICATION_RATE_VOLUME'
                  ].units
                }
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                mode={'onChange'}
                onInputChange={updateQuantity}
                onChangeUnitOption={updateQuantity}
                disabled={isReadOnly}
                required
                key={isWeight ? 'weight' : 'volume'}
              />
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default QuantityApplicationRate;
