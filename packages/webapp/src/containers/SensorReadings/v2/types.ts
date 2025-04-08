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

import type {
  Sensor,
  SensorDatapoint,
  SensorReadingTypes,
  SensorTypes,
} from '../../../store/api/types';

export type GeneralSensor = Omit<Sensor, 'name'> & {
  name: Exclude<SensorTypes, 'Weather station'>;
};

export type ChartSupportedReadingTypes = Extract<
  SensorReadingTypes,
  | 'temperature'
  | 'relative_humidity'
  | 'rainfall_rate'
  | 'cumulative_rainfall'
  | 'soil_water_potential'
  | 'soil_water_content'
  | 'water_pressure'
  | 'wind_speed'
>;

export type WeatherStationKPIParams = Extract<
  SensorReadingTypes,
  | 'temperature'
  | 'wind_speed'
  | 'wind_direction'
  | 'cumulative_rainfall'
  | 'relative_humidity'
  | 'barometric_pressure'
  | 'solar_radiation'
  | 'rainfall_rate'
>;

export interface FormattedSensorDatapoint {
  dateTime: SensorDatapoint['dateTime'];
  [key: string]: number | null;
}

export interface FormattedSensorReadings {
  reading_type: SensorReadingTypes;
  unit: string;
  readings: FormattedSensorDatapoint[];
}
