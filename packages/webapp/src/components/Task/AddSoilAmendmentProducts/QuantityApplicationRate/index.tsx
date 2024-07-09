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
import { useForm } from 'react-hook-form';
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
import { TASK_PRODUCT_FIELD_NAMES, type TaskProductFormFields } from '../types';
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
  location: Location;
  defaultValues?: TaskProductFormFields;
};

const QuantityApplicationRate = ({
  productId,
  isReadOnly,
  system, // measurementSelector
  location,
  defaultValues,
}: QuantityApplicationRateProps) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const { total_area, total_area_unit, type } = location;

  const { control, getValues, setValue, register, watch } = useForm<TaskProductFormFields>({
    defaultValues: {
      [TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED]: 100,
      ...defaultValues,
    },
  });

  /* Control of relationship between quantity, area, and application rate */
  const {
    onQuantityChange,
    onApplicationRateChange,
    onPercentLocationChange,
    isWeight,
    toggleMeasure,
    previewStringValue,
    previewStringUnit,
  } = useQuantityApplicationRate({
    total_area,
    total_area_unit,
    system,
    watch,
    setValue,
    getValues,
  });

  const percent_of_location = watch(TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED);

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

  // Unit and NumberInput accept inline style objects, rather than classnames, to style subcomponents
  const inputLabelStyles = {
    color: 'var(--Colors-Neutral-Neutral-500)',
    fontSize: '16px',
    lineHeight: 'normal',
  };

  return (
    <div className={styles.container}>
      <Switch
        leftLabel={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.WEIGHT', isWeight)}
        label={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.VOLUME', !isWeight)}
        isToggleVariant
        onChange={toggleMeasure}
        checked={!isWeight}
      />
      <div className={styles.applicationRateCard}>
        <div>
          {/* @ts-ignore */}
          <Unit
            label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.QUANTITY')}
            data-cy="soilAmendment-quantity"
            register={register}
            name={TASK_PRODUCT_FIELD_NAMES[isWeight ? 'WEIGHT' : 'VOLUME']}
            displayUnitName={TASK_PRODUCT_FIELD_NAMES[isWeight ? 'WEIGHT_UNIT' : 'VOLUME_UNIT']}
            unitType={SOIL_AMENDMENT_UNITS[isWeight ? 'WEIGHT' : 'VOLUME'].units}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            mode={'onChange'}
            onChange={onQuantityChange}
            disabled={isReadOnly}
            required
            key={isWeight ? 'weight' : 'volume'}
            classes={{ label: inputLabelStyles }}
          />
          <AreaApplicationSummary
            locationArea={previewStringValue!}
            locationAreaUnit={previewStringUnit!}
            percentOfArea={percent_of_location || 0}
            locationType={t(`FARM_MAP.MAP_FILTER.${type.toUpperCase()}`).toLocaleLowerCase()}
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
                  name={TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED}
                  control={control}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PERECENT_TO_AMEND')}
                  min={0}
                  max={100}
                  rules={{ required: t('common:REQUIRED') }}
                  onChange={onPercentLocationChange}
                  classes={{ label: inputLabelStyles }}
                  disabled={isReadOnly}
                  defaultValue={
                    defaultValues?.[TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED] || 100
                  }
                />
                <SwapIcon />
                {/* @ts-ignore */}
                <Unit
                  register={register}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.TOTAL_AREA')}
                  name={TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED}
                  displayUnitName={TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT}
                  unitType={location_area}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  mode={'onChange'}
                  disabled
                  required
                  classes={{ label: inputLabelStyles }}
                />
              </div>
              {/* @ts-ignore */}
              <Unit
                label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.APPLICATION_RATE')}
                register={register}
                name={
                  TASK_PRODUCT_FIELD_NAMES[
                    isWeight ? 'APPLICATION_RATE_WEIGHT' : 'APPLICATION_RATE_VOLUME'
                  ]
                }
                displayUnitName={
                  TASK_PRODUCT_FIELD_NAMES[
                    isWeight ? 'APPLICATION_RATE_WEIGHT_UNIT' : 'APPLICATION_RATE_VOLUME_UNIT'
                  ]
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
                onChange={onApplicationRateChange}
                disabled={isReadOnly}
                required
                key={isWeight ? 'weight' : 'volume'}
                classes={{ label: inputLabelStyles }}
              />
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default QuantityApplicationRate;
