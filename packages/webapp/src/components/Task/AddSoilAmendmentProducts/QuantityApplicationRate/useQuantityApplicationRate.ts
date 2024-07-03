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

import { useEffect } from 'react';
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { TASK_PRODUCT_FIELD_NAMES, TaskProductFormFields } from '../types';
import { getUnitOptionMap } from '../../../../util/convert-units/getUnitOptionMap';
import { convertFn, getDefaultUnit, location_area } from '../../../../util/convert-units/unit';
import { roundToTwoDecimal } from '../../../../util';
import { convert } from '../../../../util/convert-units/convert';

interface UseQuantityApplicationRate {
  total_area: number;
  total_area_unit: string;
  //   percent_of_location: number;
  system: 'metric' | 'imperial';
  isWeight: boolean;
  watch: UseFormWatch<TaskProductFormFields>;
  setValue: UseFormSetValue<TaskProductFormFields>;
}

export const useQuantityApplicationRate = ({
  total_area,
  total_area_unit,
  //   percent_of_location,
  system,
  isWeight,
  watch,
  setValue,
}: UseQuantityApplicationRate) => {
  const percent_of_location = watch(TASK_PRODUCT_FIELD_NAMES.PERCENT_OF_LOCATION);
  const application_area = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA);
  const weight = watch(TASK_PRODUCT_FIELD_NAMES.WEIGHT);
  const weight_unit = watch(TASK_PRODUCT_FIELD_NAMES.WEIGHT_UNIT);
  const volume = watch(TASK_PRODUCT_FIELD_NAMES.VOLUME);
  const volume_unit = watch(TASK_PRODUCT_FIELD_NAMES.VOLUME_UNIT);
  const application_rate_weight = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT);
  const application_rate_volume = watch(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME);

  console.log({ volume });
  console.log({ application_area });
  console.log({ application_rate_volume });

  /* Set initial application area to area total area */
  useEffect(() => {
    if (!application_area) {
      setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA, total_area);

      /* display user-selected unit initially */
      setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT, total_area_unit);
    }
  }, []);

  /* Update application area based on percent of location */
  useEffect(() => {
    const calculatedArea = (total_area * (percent_of_location || 100)) / 100;

    setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA, calculatedArea);

    /* set unit of the total area component according to default breakpoints */
    setValue(
      TASK_PRODUCT_FIELD_NAMES.APPLICATION_AREA_UNIT,
      /* @ts-ignore */
      getUnitOptionMap()[getDefaultUnit(location_area, calculatedArea, system).displayUnit],
      { shouldValidate: true },
    );
  }, [percent_of_location]);

  /* For the preview string, always use the user-defined unit. This replicates the conversion the unit component would do if the value had been displayed in a <Unit /> rather than a straight string */
  const previewStringTotalAreaValue =
    total_area &&
    roundToTwoDecimal(
      convertFn(location_area[system], total_area, location_area.databaseUnit, total_area_unit),
    );

  // useEffect(() => {
  //   let irrigatedArea = null;
  //   if (percentage_location_irrigated) {
  //     irrigatedArea = roundToTwoDecimal(
  //       location.total_area * (percentage_location_irrigated / 100),
  //     );
  //   }
  //   setValue(IRRIGATED_AREA, irrigatedArea);
  //   setValue(
  //     IRRIGATED_AREA_UNIT,
  //     getUnitOptionMap()[getDefaultUnit(location_area, irrigatedArea, system).displayUnit],
  //     { shouldValidate: true },
  //   );
  // }, [location, percentage_location_irrigated]);

  // useEffect(() => {
  //   if (irrigated_area && application_depth) {
  //     setTotalWaterUsage(
  //       convert(irrigated_area * application_depth)
  //         .from('m3')
  //         .to('l'),
  //     );
  //   } else {
  //     setTotalWaterUsage('');
  //   }
  // }, [application_depth, irrigated_area]);

  /* Update application rate based on quantity */
  useEffect(() => {
    if (weight && isWeight) {
      setValue(
        TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_WEIGHT,
        convert(weight / application_area!)
          .from('kg/m2') // database units
          .to('kg/ha'), // FIX -- should be system dependent
      );
    } else if (volume && !isWeight) {
      setValue(TASK_PRODUCT_FIELD_NAMES.APPLICATION_RATE_VOLUME, volume / application_area!);
    }
  }, [volume, weight, application_area]);

  return { previewStringTotalAreaValue };
};
