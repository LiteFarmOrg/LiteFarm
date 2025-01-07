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

export const ARRAYS = 'arrays';

export type FormFields = {
  [ARRAYS]: ArrayFormFields[];
};

// TODO: Confirm names and types
export const SensorFields = {
  ID: 'id',
  NAME: 'sensor_name',
  TYPES: 'sensor_types',
  PLACEMENT: 'sensor_placement',
  DEPTH: 'depth',
  DEPTH_UNIT: 'depth_unit',
  MANUFUCTURER: 'manufacturer',
  SENSOR_ID: 'external_id',
} as const;

export const ArrayFields = {
  ARRAY_NAME: 'array_name',
  SENSOR_COUNT: 'sensor_count',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',
  FIELD: 'field_location_id',
  SENSORS: 'sensors',
} as const;

export type ArrayFormFields = {
  [ArrayFields.ARRAY_NAME]: string;
  [ArrayFields.SENSOR_COUNT]: number;
  [ArrayFields.LATITUDE]: string;
  [ArrayFields.LONGITUDE]: string;
  [ArrayFields.FIELD]: string;
  [ArrayFields.SENSORS]: SensorFormFields[];
};

export type SensorFormFields = {
  [SensorFields.ID]: string;
  [SensorFields.NAME]: string;
  [SensorFields.TYPES]: string[];
  [SensorFields.PLACEMENT]: string;
  [SensorFields.DEPTH]: number;
  [SensorFields.DEPTH_UNIT]: string;
  [SensorFields.MANUFUCTURER]: string;
  [SensorFields.SENSOR_ID]: string;
};
