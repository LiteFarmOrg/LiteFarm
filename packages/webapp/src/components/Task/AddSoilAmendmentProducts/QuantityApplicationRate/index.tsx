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

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import styles from './styles.module.scss';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import { ReactComponent as SwapIcon } from '../../../../assets/images/swap.svg';
import TextButton from '../../../Form/Button/TextButton';
import Switch from '../../../Form/Switch';
import Unit from '../../../Form/Unit';
import NumberInput from '../../../Form/NumberInput';
import { Main } from '../../../Typography';
import { getUnitOptionMap } from '../../../../util/convert-units/getUnitOptionMap';
import {
  location_area,
  soilAmounts,
  soilAmountsVolume,
  applicationRateWeight,
  applicationRateVolume,
  getDefaultUnit,
  convertFn,
  roundToTwoDecimal,
} from '../../../../util/convert-units/unit';
import { TASK_PRODUCT_FIELD_NAMES, type TaskProductFormFields } from '../types';

/* -----------------
  temporarily in component */
const SOIL_AMENDMENT_UNITS = {
  WEIGHT: {
    units: soilAmounts, // original
  },
  VOLUME: {
    units: soilAmountsVolume,
  },
  APPLICATION_RATE_WEIGHT: {
    units: applicationRateWeight, // TODO: create new
  },
  APPLICATION_RATE_VOLUME: {
    units: applicationRateVolume, // TODO: create new
  },
};
/* ----------------- */

interface Location {
  type: string;
  total_area: number;
  total_area_unit: string;
}

export type QuantityApplicationRateProps = {
  productId: number | string;
  isReadOnly: boolean;
  system: 'metric' | 'imperial';
  location: Location;
};

const QuantityApplicationRate = ({
  productId,
  isReadOnly,
  system = 'metric', // measurementSelector
  location,
}: QuantityApplicationRateProps) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const [isWeight, setIsWeight] = useState(true);
  const toggleUnit = () => setIsWeight((prev) => !prev);

  const { total_area, total_area_unit, type } = location;

  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    setFocus,
    trigger,
    register,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<TaskProductFormFields>({
    mode: 'onBlur',
  });

  const PERCENT_OF_LOCATION = watch(TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION);
  const APPLICATION_AREA = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA);
  const QUANTITY_TO_APPLY_WEIGHT = watch(TASK_PRODUCT_FIELD_NAMES.WEIGHT);
  const QUANTITY_TO_APPLY_VOLUME = watch(TASK_PRODUCT_FIELD_NAMES.VOLUME);

  /* Set initial application area to area total area */
  useEffect(() => {
    if (!APPLICATION_AREA) {
      setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA, total_area);

      /* display user-selected unit initially */
      setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT, total_area_unit);
    }
  }, []);

  /* For the preview string, always use the user-defined unit. This replicates the conversion the unit component would do if the value had been displayed in a <Unit /> rather than a straight string */
  const previewStringTotalAreaValue =
    total_area &&
    roundToTwoDecimal(
      convertFn(location_area[system], total_area, location_area.databaseUnit, total_area_unit),
    );

  /* Update application area based on percent of location */
  useEffect(() => {
    const calculated_area = total_area * (PERCENT_OF_LOCATION || 100) * 0.01;
    setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA, calculated_area);

    /* calculate appropriate unit for the calculated area according to defined breakpoints */
    setValue(
      TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT,
      /* @ts-ignore */
      getUnitOptionMap()[getDefaultUnit(location_area, calculated_area, system).displayUnit],
    );
  }, [PERCENT_OF_LOCATION]);

  /* Update application rate based on quantity */
  useEffect(() => {
    if (QUANTITY_TO_APPLY_WEIGHT) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE,
        QUANTITY_TO_APPLY_WEIGHT / APPLICATION_AREA!,
      );
    }
    if (QUANTITY_TO_APPLY_VOLUME) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE,
        QUANTITY_TO_APPLY_VOLUME / APPLICATION_AREA!,
      );
    }
  }, [QUANTITY_TO_APPLY_VOLUME, QUANTITY_TO_APPLY_WEIGHT]);

  /* Label for weight/volume switch */
  const formatLabel = (labelKey: string, shouldBeBold: boolean) => {
    // t('ADD_TASK.SOIL_AMENDMENT_VIEW.WEIGHT')
    // t('ADD_TASK.SOIL_AMENDMENT_VIEW.VOLUME')
    const label = t(labelKey);
    return shouldBeBold ? <b>{label}</b> : label;
  };

  return (
    <div className={styles.container}>
      <Switch
        leftLabel={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.WEIGHT', isWeight)}
        label={formatLabel('ADD_TASK.SOIL_AMENDMENT_VIEW.VOLUME', !isWeight)}
        isToggleVariant
        onChange={toggleUnit}
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
            disabled={isReadOnly}
            required
            key={isWeight ? 'weight' : 'volume'}
          />
          <FieldApplicationSummary
            locationArea={previewStringTotalAreaValue}
            locationAreaUnit={total_area_unit}
            percentOfArea={PERCENT_OF_LOCATION || 0}
            locationType={t(`FARM_MAP.MAP_FILTER.${type.toUpperCase()}`).toLocaleLowerCase()}
          />
        </div>
        <div className={clsx(styles.border, styles.advancedSection, isExpanded && styles.expanded)}>
          <TextButton onClick={toggleExpanded} className={clsx(styles.advancedTitle)}>
            <span>{t('ADD_TASK.SOIL_AMENDMENT_VIEW.ADVANCED')}</span>
            <KeyboardArrowDownIcon className={styles.expandIcon} />
          </TextButton>

          <Collapse
            id={`application_rate-${productId}`}
            in={isExpanded}
            timeout="auto"
            unmountOnExit
          >
            <div className={styles.sectionBody}>
              <div className={styles.locationSection}>
                <NumberInput
                  name={TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION}
                  control={control}
                  defaultValue={100}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.PERECENT_TO_AMEND')}
                  min={0}
                  max={100}
                  rules={{ required: t('common:REQUIRED') }}
                />
                <SwapIcon />
                {/* @ts-ignore */}
                <Unit
                  register={register}
                  label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.TOTAL_AREA')}
                  name={TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA}
                  displayUnitName={TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT}
                  unitType={location_area}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  disabled
                  required
                />
              </div>
              {/* @ts-ignore */}
              <Unit
                label={t('ADD_TASK.SOIL_AMENDMENT_VIEW.APPLICATION_RATE')}
                register={register}
                name={TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE}
                displayUnitName={TASK_PRODUCT_FIELD_NAMES[isWeight ? 'WEIGHT_UNIT' : 'VOLUME_UNIT']}
                unitType={SOIL_AMENDMENT_UNITS[isWeight ? 'WEIGHT' : 'VOLUME'].units}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
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

interface FieldApplicationSummaryProps {
  locationArea: number;
  locationAreaUnit: string;
  percentOfArea: number;
  locationType: string;
}

const FieldApplicationSummary = ({
  locationArea,
  locationAreaUnit,
  percentOfArea,
  locationType,
}: FieldApplicationSummaryProps) => {
  return (
    <Main>
      <Trans
        i18nKey="ADD_TASK.SOIL_AMENDMENT_VIEW.APPLIED_TO"
        values={{
          percentOfArea,
          locationArea,
          locationAreaUnit,
          locationType,
        }}
      >
        Applied to <b>{{ percentOfArea } as any}%</b> of your{' '}
        <em>
          {/* see https://github.com/i18next/react-i18next/issues/1483 for necessity of any */}
          {{ locationArea } as any} {{ locationAreaUnit } as any}
        </em>{' '}
        {locationType}
      </Trans>
    </Main>
  );
};
