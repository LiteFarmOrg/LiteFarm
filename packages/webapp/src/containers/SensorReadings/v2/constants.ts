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
import type {
  SensorReadingTypes,
  SensorReadingTypeUnits,
  SensorTypes,
} from '../../../store/api/types';
import type { ExtendedMeasureUnits } from '../../../util/convert-units/convert';
import { ChartSupportedReadingTypes, WeatherStationKPIParams } from './types';

export const SENSOR_READING_TYPES: Record<SensorTypes, ChartSupportedReadingTypes[]> = {
  'Soil Water Potential Sensor': ['temperature', 'soil_water_potential', 'soil_water_content'],
  'IR Temperature Sensor': ['temperature'],
  'Wind speed sensor': ['wind_speed'],
  'Drip line pressure sensor': ['water_pressure'],
  'Weather station': ['temperature', 'relative_humidity', 'rainfall_rate', 'cumulative_rainfall'],
};

export const SENSOR_ARRAY_CHART_PARAMS = SENSOR_READING_TYPES['Soil Water Potential Sensor'];

export const CHART_SUPPORTED_PARAMS: ChartSupportedReadingTypes[] = [
  'temperature',
  'relative_humidity',
  'rainfall_rate',
  'cumulative_rainfall',
  'soil_water_potential',
  'soil_water_content',
  'water_pressure',
  'wind_speed',
];

export const WEATHER_STATION_KPI_PARAMS: WeatherStationKPIParams[] = [
  'temperature',
  'wind_speed',
  'wind_direction',
  'cumulative_rainfall',
  'relative_humidity',
  'barometric_pressure',
  'solar_radiation',
  'rainfall_rate',
];

export const WEATHER_STATION_KPI_DEFAULT_LABEL_KEYS = [
  'TEMPERATURE',
  'WIND_SPEED_AND_DIRECTION',
  'CUMULATIVE_RAINFALL',
  'RELATIVE_HUMIDITY',
  'BAROMETRIC_PRESSURE',
  'SOLAR_RADIATION',
  'RAINFALL_RATE',
];

export const STANDALONE_SENSOR_COLORS_MAP: Record<ChartSupportedReadingTypes, string> = {
  temperature: colors.chartRed,
  relative_humidity: colors.chartBlue,
  rainfall_rate: colors.chartYellow,
  cumulative_rainfall: colors.chartGreen,
  soil_water_potential: colors.chartBlue,
  soil_water_content: colors.chartPurple,
  water_pressure: colors.chartBrown,
  wind_speed: colors.chartBrown,
};

export const LINE_COLORS = [
  colors.chartBlue,
  colors.chartYellow,
  colors.chartGreen,
  colors.chartRed,
  colors.chartPurple,
  colors.chartBrown,
];

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
  soil_water_potential: {
    metric: {
      unit: 'kPa',
      displayUnit: 'kPa',
    },
    imperial: {
      unit: 'psi',
      displayUnit: 'psi',
    },
    baseUnit: 'kPa',
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
