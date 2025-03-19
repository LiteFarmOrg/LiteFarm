import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationFieldTechnology from '../../../components/LocationFieldTechnology';
import { useMemo } from 'react';
import useGroupedSensors from '../../SensorList/useGroupedSensors';
import { AreaLocation, getPointLocationsWithinPolygon } from '../../../util/geoUtils';
import { History } from 'history';
import { match } from 'react-router-dom';

export interface FieldTechnology {
  externalSensors?: any[];
  externalSensorArrays?: any[];
}

interface LocationFieldTechnologyProps {
  history: History;
  match: match<{ location_id: string }>;
}

function LocationFieldTechnology({ history, match }: LocationFieldTechnologyProps) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id)) as AreaLocation | undefined;

  const { groupedSensors } = useGroupedSensors();

  const fieldTechnology = useMemo<FieldTechnology>(() => {
    let ft: FieldTechnology = {};

    if (location) {
      const sensors = groupedSensors.filter((sensor) => !sensor.isSensorArray);
      if (sensors.length) {
        // use the function directly -- don't use a hook if not at top level
        ft.externalSensors = getPointLocationsWithinPolygon(sensors, location.grid_points);
      }
      const sensorArrays = groupedSensors.filter((sensor) => sensor.isSensorArray);
      if (sensorArrays.length) {
        ft.externalSensorArrays = getPointLocationsWithinPolygon(
          sensorArrays,
          location.grid_points,
        );
      }
    }
    return ft;
  }, [location, groupedSensors]);

  return (
    <>
      <PureLocationFieldTechnology
        fieldTechnology={fieldTechnology}
        history={history}
        match={match}
        location={location}
        hasCrops={false} // needs this?
        hasReadings={false} // needs this?
      />
    </>
  );
}

export default LocationFieldTechnology;
