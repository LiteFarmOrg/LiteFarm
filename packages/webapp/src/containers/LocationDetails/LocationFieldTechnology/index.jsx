import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';

import PureLocationFieldTechnology from '../../../components/LocationFieldTechnology';
import { sensorSelector } from '../../sensorSlice';
import useGroupedSensors, { SensorType } from '../../SensorList/useGroupedSensors';
import { getPointLocationsWithinPolygon } from '../../../util/geoUtils';

function LocationFieldTechnology({ history, match }) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  const sensors = useSelector(sensorSelector);
  const { groupedSensors } = useGroupedSensors();

  let fieldTechnology = {};

  if (location) {
    if (sensors) {
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

  return (
    <PureLocationFieldTechnology
      fieldTechnology={fieldTechnology}
      history={history}
      match={match}
      location={location}
    />
  );
}

export default LocationFieldTechnology;
