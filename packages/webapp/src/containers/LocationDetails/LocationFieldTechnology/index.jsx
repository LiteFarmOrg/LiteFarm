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
import useGroupedSensors from '../../SensorList/useGroupedSensors';

function LocationFieldTechnology({ history, match }) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  const sensors = useSelector(sensorSelector);
  const externalSensors = useSelector(allSensorsSelector);
  // const externalStandaloneSensors = useSelector(standaloneSensorsSelector);
  // const externalSensorArrays = useSelector(sensorArraysSelector);
  const { isLoading, groupedSensors } = useGroupedSensors();

  console.log(externalSensors);
  console.log(groupedSensors);

  const [fieldTechnology, setFieldTechnology] = useState({});

  useEffect(() => {
    let ft = {};
    if (sensors) {
      ft['sensors'] = useLocationsContainedWithinArea(sensors, location.grid_points);
    }
    if (groupedSensors.filter((s) => !s.isSensorArray).length) {
      ft['externalSensors'] = useLocationsContainedWithinArea(
        groupedSensors.filter((s) => !s.isSensorArray),
        location.grid_points,
      );
    }
    if (externalSensors && groupedSensors.filter((s) => s.isSensorArray).length) {
      // const arraysInlocation = structuredClone(
      //   useLocationsContainedWithinArea(externalSensorArrays, location.grid_points),
      // );
      ft['externalSensorArrays'] = useLocationsContainedWithinArea(
        groupedSensors.filter((s) => s.isSensorArray),
        location.grid_points,
      );
      // const arraysInlocation = useLocationsContainedWithinArea(groupedSensors.filter((s) => s.isSensorArray), location.grid_points);
      // ft['externalSensorArrays'] = arraysInlocation.map((sensorArray) => {
      //   // This is mutating the store state??
      //   sensorArray.sensors = sensorArray.sensors.map((sensorId) =>
      //     externalSensors.find((sensor) => sensor.location_id === sensorId),
      //   );
      //   return sensorArray;
      // });
    }

    setFieldTechnology(ft);
    // NOW THIS - grouped sensors is causing an infinite render cycle
  }, [sensors, externalSensors, groupedSensors]);

  console.log(fieldTechnology);
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
