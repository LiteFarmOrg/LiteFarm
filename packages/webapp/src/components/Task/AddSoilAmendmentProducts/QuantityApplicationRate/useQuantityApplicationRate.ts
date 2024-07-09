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
import { UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { TASK_PRODUCT_FIELD_NAMES, TaskProductFormFields } from '../types';
import { getUnitOptionMap } from '../../../../util/convert-units/getUnitOptionMap';
import { convertFn, getDefaultUnit, location_area } from '../../../../util/convert-units/unit';
import { roundToTwoDecimal } from '../../../../util';
import { convert } from '../../../../util/convert-units/convert';

interface UseQuantityApplicationRate {
  total_area: number;
  total_area_unit: 'm2' | 'ha' | 'ft2' | 'ac'; // as defined in location_area
  system: 'metric' | 'imperial';
  watch: UseFormWatch<TaskProductFormFields>;
  setValue: UseFormSetValue<TaskProductFormFields>;
  getValues: UseFormGetValues<TaskProductFormFields>;
}

export const useQuantityApplicationRate = ({
  total_area,
  total_area_unit,
  system,
  watch,
  setValue,
  getValues,
}: UseQuantityApplicationRate) => {
  const application_area = watch(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED);
  const application_area_unit = watch(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT);
  const weight_unit = watch(TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT);
  const volume_unit = watch(TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT);
  const application_rate_weight_unit = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT);
  const application_rate_volume_unit = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT);

  const [isWeight, setIsWeight] = useState(() => {
    const volumeValue = getValues(TASK_PRODUCT_FIELD_NAMES.VOLUME);
    return isNaN(Number(volumeValue));
  });

  const toggleMeasure = () => {
    setIsWeight((prev) => !prev);
  };

  /* Set initial application area to area total area */
  useEffect(() => {
    if (!application_area) {
      setValue(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED, total_area);
    }

    /* update unit of application area and string */
    onPercentLocationChange();
  }, []);

  /* Update application area + rate based on percent of location */
  const onPercentLocationChange = () => {
    const percent_of_location = getValues(TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION_AMENDED);

    const calculatedArea = (total_area * (percent_of_location || 100)) / 100;
    setValue(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED, calculatedArea);

    /* set unit of the total area component according to default breakpoints */
    setValue(
      TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT,
      /* @ts-ignore */
      getUnitOptionMap()[getDefaultUnit(location_area, calculatedArea, system).displayUnit],
      { shouldValidate: true },
    );

    /* update application rate */
    onQuantityChange();
  };

  const onQuantityChange = () => {
    const weight = getValues(TASK_PRODUCT_FIELD_NAMES.WEIGHT);
    const weight_unit = getValues(TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT);
    const application_area = getValues(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED);

    const volume = getValues(TASK_PRODUCT_FIELD_NAMES.VOLUME);
    const volume_unit = getValues(TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT);

    if (weight && isWeight && weight_unit && application_area) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT,
        convert(weight / application_area)
          .from('kg/m2') // database unit weight / database unit area
          .to('kg/ha'), // database unit application_rate_weight
      );
    } else if (volume && !isWeight && volume_unit && application_area) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME,
        convert(volume / application_area)
          .from('l/m2') // database unit volume / database unit area
          .to('l/ha'), // database unit application_rate_volume
      );
    }
  };

  const onApplicationRateChange = () => {
    const application_rate_weight = getValues(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT);
    const application_rate_weight_unit = getValues(
      TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT_UNIT,
    );
    const application_rate_volume = getValues(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME);
    const application_rate_volume_unit = getValues(
      TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME_UNIT,
    );

    const application_area = getValues(TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED);
    if (isWeight && application_rate_weight && application_rate_weight_unit && application_area) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.WEIGHT,
        convert(application_rate_weight).from('kg/ha').to('kg/m2') * application_area,
      );
    } else if (
      !isWeight &&
      application_rate_volume &&
      application_rate_volume_unit &&
      application_area
    ) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.VOLUME,
        convert(application_rate_volume).from('l/ha').to('l/m2') * application_area,
      );
    }
  };

  /* Trigger recalculation when units are changed */
  useEffect(() => {
    onQuantityChange();
  }, [weight_unit, volume_unit]);

  useEffect(() => {
    onApplicationRateChange();
  }, [application_rate_weight_unit, application_rate_volume_unit]);

  /* For the preview string, replicate the conversion the unit component would do if the value had been displayed in a <Unit /> rather than a string. However, don't update upon changes to application_area_unit beyond the initial undefined > defined change */
  const [previewStringValue, setPreviewStringValue] = useState<number | null>(null);
  const [previewStringUnit, setPreviewStringUnit] = useState<string | null>(null);

  useEffect(() => {
    if (application_area_unit && previewStringValue === null) {
      /* if the user-selected unit is in the wrong system (e.g. metric stored value but farm on imperial), use the <Unit /> converted unit */
      const unit = location_area[system].units.includes(total_area_unit)
        ? getUnitOptionMap()[total_area_unit]
        : application_area_unit;

      const value =
        total_area &&
        roundToTwoDecimal(
          convertFn(location_area[system], total_area, location_area.databaseUnit, unit.value),
        );

      setPreviewStringValue(value);
      setPreviewStringUnit(unit.label);
    }
  }, [location_area, application_area_unit]);

  return {
    isWeight,
    toggleMeasure,
    previewStringValue,
    previewStringUnit,
    onQuantityChange,
    onApplicationRateChange,
    onPercentLocationChange,
  };
};
