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

import { Point } from '../../util/geoUtils';
import { SensorReadingTypeUnits } from '../../store/api/types';
import {
  EvapotranspirationRateUnits,
  WaterConsumptionUnits,
} from '../../util/convert-units/extendedMeasures';
export interface UriPrescriptionData {
  soil_moisture_deficit: number;
  application_depth: number;
  application_depth_unit: string;
}

export type VriPrescriptionData = UriPrescriptionData & {
  grid_points: Point[];
};

export type IrrigationPrescriptionTableInfo = UriPrescriptionData & {
  id: number;
};

export type IrrigationPrescriptionDataTypes =
  | 'temperature'
  | 'wind_speed'
  | 'cumulative_rainfall'
  | 'et_rate'
  | 'estimated_time'
  | 'estimated_water_consumption';

export type IrrigationPrescriptionDataTypeUnits =
  | SensorReadingTypeUnits
  | EvapotranspirationRateUnits
  | WaterConsumptionUnits;
