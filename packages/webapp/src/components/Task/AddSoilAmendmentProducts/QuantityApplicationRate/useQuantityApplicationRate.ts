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
import { TASK_PRODUCT_FIELD_NAMES, UnitOption } from '../types';
import { getUnitOptionMap } from '../../../../util/convert-units/getUnitOptionMap';
import { convertFn, getDefaultUnit, location_area } from '../../../../util/convert-units/unit';
import { roundToTwoDecimal } from '../../../../util';
import { convert } from '../../../../util/convert-units/convert';
import { useFormContext } from 'react-hook-form';

interface UseQuantityApplicationRate {
  total_area: number;
  total_area_unit: 'm2' | 'ha' | 'ft2' | 'ac'; // as defined in location_area
  system: 'metric' | 'imperial';
  namePrefix: string;
}

export const useQuantityApplicationRate = ({
  total_area,
  total_area_unit,
  system,
  namePrefix,
}: UseQuantityApplicationRate) => {
  const TOTAL_AREA_AMENDED = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED}`;
  const TOTAL_AREA_AMENDED_UNIT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.TOTAL_AREA_AMENDED_UNIT}`;
  const VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.VOLUME}`;
  const WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.WEIGHT}`;
  const APPLICATION_RATE_WEIGHT = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT}`;
  const APPLICATION_RATE_VOLUME = `${namePrefix}.${TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME}`;

  const { setValue, getValues, watch } = useFormContext();

  const application_area_unit = watch(TOTAL_AREA_AMENDED_UNIT);

  const [isWeight, setIsWeight] = useState(() => {
    const volumeValue = getValues(VOLUME);
    return isNaN(Number(volumeValue));
  });

  const toggleMeasure = () => {
    setIsWeight((prev) => !prev);
  };

  /* Update application area + rate based on percent of location */
  const onPercentLocationChange = (percent_of_location: number) => {
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

  const updateApplicationRate = (updatedUnit?: UnitOption) => {
    const weight = getValues(WEIGHT);
    const volume = getValues(VOLUME);
    const application_area = getValues(TOTAL_AREA_AMENDED);

    if ((weight || weight === 0) && isWeight && application_area) {
      setValue(
        APPLICATION_RATE_WEIGHT,
        convert(weight / application_area)
          .from(isWeight && updatedUnit ? updatedUnit.value : 'kg/m2') // database or selected unit weight / database unit area
          .to('kg/ha'), // database unit application_rate_weight
        { shouldValidate: true },
      );
    } else if ((volume || volume === 0) && !isWeight && application_area) {
      setValue(
        APPLICATION_RATE_VOLUME,
        convert(volume / application_area)
          .from(!isWeight && updatedUnit ? updatedUnit.value : 'l/m2') // database or selected unit volume / database unit area
          .to('l/ha'), // database unit application_rate_volume
        { shouldValidate: true },
      );
    }
  };

  const updateQuantity = (updatedUnit?: UnitOption) => {
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
        convert(application_rate_weight)
          .from(updatedUnit && isWeight ? updatedUnit.value : 'kg/ha')
          .to('kg/m2') * application_area,
        { shouldValidate: true },
      );
    } else if (
      !isWeight &&
      (application_rate_volume || application_rate_volume === 0) &&
      application_area
    ) {
      setValue(
        VOLUME,
        convert(application_rate_volume)
          .from(!isWeight && updatedUnit ? updatedUnit.value : 'l/ha')
          .to('l/m2') * application_area,
        { shouldValidate: true },
      );
    }
  };

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
    updateApplicationRate,
    updateQuantity,
    onPercentLocationChange,
  };
};
