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

import { colors } from '../../../assets/theme';
import type { SensorReadingTypes, SensorReadingTypeUnits } from '../../../store/api/types';
import type { ExtendedMeasureUnits } from '../../../util/convert-units/convert';

export const SENSOR_PARAMS: SensorReadingTypes[] = [
  'temperature',
  'relative_humidity',
  'rainfall_rate',
  'cumulative_rainfall',
  'soil_water_potential',
  'soil_water_content',
  'water_pressure',
];

export const SENSOR_ARRAY_PARAMS: SensorReadingTypes[] = [
  'temperature',
  'soil_water_potential',
  'soil_water_content',
];

export const STANDALONE_SENSOR_COLORS_MAP: Partial<Record<SensorReadingTypes, string>> = {
  temperature: colors.chartRed,
  relative_humidity: colors.chartBlue,
  rainfall_rate: colors.chartYellow,
  cumulative_rainfall: colors.chartGreen,
  soil_water_potential: colors.chartBlue,
  soil_water_content: colors.chartPurple,
  water_pressure: colors.chartBrown,
};

interface UnitType {
  metric: {
    unit: ExtendedMeasureUnits;
    displayUnit: string;
  };
  imperial: {
    unit: ExtendedMeasureUnits;
    displayUnit: string;
  };
  baseUnit: Extract<SensorReadingTypeUnits, ExtendedMeasureUnits>;
}

// Mapping of sensor reading types that require unit conversion.
// (baseUnit refers to the unit sent by ESci)
// We use psi for water pressure, as it's commonly used in Canada,
// even though the metric system is generally used.
export const esciUnitTypeMap: Partial<Record<SensorReadingTypes, UnitType>> = {
  temperature: {
    metric: {
      unit: 'C',
      displayUnit: '°C',
    },
    imperial: {
      unit: 'F',
      displayUnit: '°F',
    },
    baseUnit: 'C',
  },
  wind_speed: {
    metric: {
      unit: 'km/h',
      displayUnit: 'km/h',
    },
    imperial: {
      unit: 'mph',
      displayUnit: 'mph',
    },
    baseUnit: 'm/s',
  },
  cumulative_rainfall: {
    metric: {
      unit: 'mm',
      displayUnit: 'mm',
    },
    imperial: {
      unit: 'in',
      displayUnit: 'in',
    },
    baseUnit: 'mm',
  },
  rainfall_rate: {
    metric: {
      unit: 'mm',
      displayUnit: 'mm/h',
    },
    imperial: {
      unit: 'in',
      displayUnit: 'in/h',
    },
    baseUnit: 'mm',
  },
};
