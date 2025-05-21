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

import useGroupedSensors, { SensorType } from '../../SensorList/useGroupedSensors';

export default function useFieldTechnology(location) {
  const { groupedSensors } = useGroupedSensors();

  let fieldTechnology = {};

  if (location && location.grid_points) {
    fieldTechnology.addonSensors = groupedSensors.filter(
      (sensor) =>
        sensor.type == SensorType.SENSOR &&
        sensor.fields.some((field) => field.location_id === location.location_id),
    );

    fieldTechnology.addonSensorArrays = groupedSensors.filter(
      (sensorArray) =>
        sensorArray.type == SensorType.SENSOR_ARRAY &&
        sensorArray.fields.some((field) => field.location_id === location.location_id),
    );
  }

  return fieldTechnology;
}
