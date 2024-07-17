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

import { useEffect, useMemo } from 'react';
import { TASK_PRODUCT_FIELD_NAMES } from '../types';
import { getUnitOptionMap } from '../../../../util/convert-units/getUnitOptionMap';
import { convertFn, getDefaultUnit, location_area } from '../../../../util/convert-units/unit';
import { roundToTwoDecimal } from '../../../../util';
import { convert } from '../../../../util/convert-units/convert';
import { useFormContext } from 'react-hook-form';

interface UseQuantityApplicationRate {
  total_area: number;
  total_area_unit?: 'm2' | 'ha' | 'ft2' | 'ac'; // as defined in location_area
  system: 'metric' | 'imperial';
  isWeight: boolean;
  namePrefix: string;
}

export const useQuantityApplicationRate = ({
  total_area,
  total_area_unit,
  system,
  isWeight,
  namePrefix,
}: UseQuantityApplicationRate) => {
  const TOTAL_AREA_AMENDED = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED}`;
  const TOTAL_AREA_AMENDED_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT}`;
  const VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.VOLUME}`;
  const WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.WEIGHT}`;
  const WEIGHT_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT}`;
  const VOLUME_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT}`;
  const APPLICATION_RATE_WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT}`;
  const APPLICATION_RATE_VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME}`;
  const APPLICATION_RATE_WEIGHT_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT}`;
  const APPLICATION_RATE_VOLUME_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT}`;

  const { setValue, getValues, watch } = useFormContext();

  const [
    application_area_unit,
    weight_unit,
    volume_unit,
    application_rate_weight_unit,
    application_rate_volume_unit,
  ] = watch([
    TOTAL_AREA_AMENDED_UNIT,
    WEIGHT_UNIT,
    VOLUME_UNIT,
    APPLICATION_RATE_WEIGHT_UNIT,
    APPLICATION_RATE_VOLUME_UNIT,
  ]);

  useEffect(() => {
    updateTotalArea(100);
  }, []);

  /* Update application area + rate based on percent of location */
  const updateTotalArea = (percent_of_location: number) => {
    const calculatedArea = (total_area * Math.min(percent_of_location || 100, 100)) / 100;
    setValue(TOTAL_AREA_AMENDED, calculatedArea);

    /* set unit of the total area component according to default breakpoints */
    setValue(
      TOTAL_AREA_AMENDED_UNIT,
      /* @ts-ignore */
      getUnitOptionMap()[getDefaultUnit(location_area, calculatedArea, system).displayUnit],
      { shouldValidate: true },
    );

    updateApplicationRate();
  };

  const updateApplicationRate = () => {
    const weight = getValues(WEIGHT);
    const application_area = getValues(TOTAL_AREA_AMENDED);
    const volume = getValues(VOLUME);
    if ((weight || weight === 0) && isWeight && application_area) {
      setValue(
        APPLICATION_RATE_WEIGHT,
        convert(weight / application_area)
          .from('kg/m2') // database unit weight / database unit area
          .to('kg/ha'), // database unit application_rate_weight
        { shouldValidate: true },
      );
    } else if ((volume || volume === 0) && !isWeight && application_area) {
      setValue(
        APPLICATION_RATE_VOLUME,
        convert(volume / application_area)
          .from('l/m2') // database unit volume / database unit area
          .to('l/ha'), // database unit application_rate_volume
        { shouldValidate: true },
      );
    }
  };

  const updateQuantity = () => {
    const application_rate_weight = getValues(APPLICATION_RATE_WEIGHT);
    const application_rate_volume = getValues(APPLICATION_RATE_VOLUME);
    const application_area = getValues(TOTAL_AREA_AMENDED);
    if (
      isWeight &&
      (application_rate_weight || application_rate_weight === 0) &&
      application_area
    ) {
      setValue(
        WEIGHT,
        convert(application_rate_weight).from('kg/ha').to('kg/m2') * application_area,
        { shouldValidate: true },
      );
    } else if (
      !isWeight &&
      (application_rate_volume || application_rate_volume === 0) &&
      application_area
    ) {
      setValue(
        VOLUME,
        convert(application_rate_volume).from('l/ha').to('l/m2') * application_area,
        { shouldValidate: true },
      );
    }
  };

  /* Trigger recalculation when units are changed. Note this cannot be done on the onChangeUnitOption handler because that callback is triggered before the database (hidden input) value has been updated, which the calculations require  */
  useEffect(() => {
    updateApplicationRate();
  }, [weight_unit, volume_unit]);

  useEffect(() => {
    updateQuantity();
  }, [application_rate_weight_unit, application_rate_volume_unit]);

  /* For the preview string, replicate the conversion the unit component would do if the value had been displayed in a <Unit /> rather than a string. However, don't update upon changes to application_area_unit beyond the initial undefined > defined change */
  const previewStrings = useMemo(() => {
    let previewStringUnit;
    let previewStringValue;

    if (application_area_unit) {
      previewStringUnit =
        total_area_unit && location_area[system].units.includes(total_area_unit)
          ? getUnitOptionMap()[total_area_unit]
          : application_area_unit;

      previewStringValue =
        total_area &&
        roundToTwoDecimal(
          convertFn(
            location_area[system],
            total_area,
            location_area.databaseUnit,
            previewStringUnit.value,
          ),
        );
      previewStringUnit = previewStringUnit.label;
    }

    return { previewStringUnit, previewStringValue };
  }, [!!application_area_unit, total_area]);

  return {
    previewStringValue: previewStrings.previewStringValue,
    previewStringUnit: previewStrings.previewStringUnit,
    updateApplicationRate,
    updateQuantity,
    updateTotalArea,
  };
};
