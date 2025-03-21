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

import { SensorReadingTypes, SensorTypes } from '../../../store/api/types';

export const SENSOR_PARAMS: Partial<Record<SensorTypes, SensorReadingTypes[]>> = {
  'Weather station': ['temperature', 'relative_humidity', 'rainfall_rate', 'cumulative_rainfall'],
  'Soil Water Potential Sensor': ['temperature', 'soil_water_potential'],
};
