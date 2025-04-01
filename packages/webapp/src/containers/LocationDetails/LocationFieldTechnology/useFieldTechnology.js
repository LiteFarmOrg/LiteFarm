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

import { useSelector } from 'react-redux';
import { sensorSelector } from '../../sensorSlice';
import useGroupedSensors, { SensorType } from '../../SensorList/useGroupedSensors';
import { getPointLocationsWithinPolygon } from '../../../util/geoUtils';

export default function useFieldTechnology(location) {
  const sensors = useSelector(sensorSelector);
  const { groupedSensors } = useGroupedSensors();

  let fieldTechnology = {};

  if (location && location.grid_points) {
    if (sensors.length) {
      fieldTechnology.sensors = getPointLocationsWithinPolygon(sensors, location.grid_points);
    }
    const addonSensors = groupedSensors.filter((sensor) => sensor.type == SensorType.SENSOR);
    if (addonSensors.length) {
      fieldTechnology.addonSensors = getPointLocationsWithinPolygon(
        addonSensors,
        location.grid_points,
      );
    }
    const addonSensorArrays = groupedSensors.filter(
      (sensor) => sensor.type == SensorType.SENSOR_ARRAY,
    );
    if (addonSensorArrays.length) {
      fieldTechnology.addonSensorArrays = getPointLocationsWithinPolygon(
        addonSensorArrays,
        location.grid_points,
      );
    }
  }

  return fieldTechnology;
}
