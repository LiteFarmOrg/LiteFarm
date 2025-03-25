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
    const externalSensors = groupedSensors.filter((sensor) => sensor.type == SensorType.SENSOR);
    if (externalSensors.length) {
      fieldTechnology.externalSensors = getPointLocationsWithinPolygon(
        externalSensors,
        location.grid_points,
      );
    }
    const externalSensorArrays = groupedSensors.filter(
      (sensor) => sensor.type == SensorType.SENSOR_ARRAY,
    );
    if (externalSensorArrays.length) {
      fieldTechnology.externalSensorArrays = getPointLocationsWithinPolygon(
        externalSensorArrays,
        location.grid_points,
      );
    }
  }

  return fieldTechnology;
}
