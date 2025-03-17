import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import { useLocationsContainedWithinArea } from '../../../hooks/useFarmAreasContainingPoint';

import PureLocationFieldTechnology from '../../../components/LocationFieldTechnology';
import { useEffect, useState } from 'react';
import { sensorSelector } from '../../sensorSlice';
import {
  allSensorsSelector,
  sensorArraysSelector,
  standaloneSensorsSelector,
} from '../../../store/api/selectors/sensorSelectors';

function LocationFieldTechnology({ history, match }) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  const sensors = useSelector(sensorSelector);
  const externalSensors = useSelector(allSensorsSelector);
  const externalStandaloneSensors = useSelector(standaloneSensorsSelector);
  const externalSensorArrays = useSelector(sensorArraysSelector);

  //console.log(externalSensors)
  //console.log(externalSensorArrays)

  const [fieldTechnology, setFieldTechnology] = useState({});
  useEffect(() => {
    let ft = {};
    if (sensors) {
      ft['sensors'] = useLocationsContainedWithinArea(sensors, location.grid_points);
    }
    if (externalStandaloneSensors) {
      ft['externalSensors'] = useLocationsContainedWithinArea(
        externalStandaloneSensors,
        location.grid_points,
      );
    }
    if (externalSensors && externalSensorArrays) {
      const arraysInlocation = structuredClone(
        useLocationsContainedWithinArea(externalSensorArrays, location.grid_points),
      );
      // const arraysInlocation = useLocationsContainedWithinArea(externalSensorArrays, location.grid_points);
      ft['externalSensorArrays'] = arraysInlocation.map((sensorArray) => {
        // This is mutating the store state??
        sensorArray.sensors = sensorArray.sensors.map((sensorId) =>
          externalSensors.find((sensor) => sensor.location_id === sensorId),
        );
        return sensorArray;
      });
    }

    setFieldTechnology(ft);
  }, [sensors, externalSensors, externalSensorArrays, externalStandaloneSensors]);

  return (
    <>
      <PureLocationFieldTechnology
        fieldTechnology={fieldTechnology}
        history={history}
        match={match}
        location={location}
      />
    </>
  );
}

export default LocationFieldTechnology;
