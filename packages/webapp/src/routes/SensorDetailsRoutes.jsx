/* eslint-disable react/no-children-prop */
import { Route } from 'react-router';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import SensorDetail from '../containers/LocationDetails/PointDetails/SensorDetail';
import UpdateSensor from '../containers/LocationDetails/PointDetails/SensorDetail/EditSensor';
import SensorReadings from '../containers/SensorReadings';
import { isAdminSelector } from '../containers/userFarmSlice';
import { useSelector } from 'react-redux';

export default function SensorDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/sensor/:location_id/tasks" exact children={<LocationTasks />} />
      <Route path="/sensor/:location_id/readings" exact children={<SensorReadings />} />
      <Route path="/sensor/:location_id/details" exact children={<SensorDetail />} />
      {isAdmin && <Route path="/sensor/:location_id/edit" exact children={<UpdateSensor />} />}
    </>
  );
}
