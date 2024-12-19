/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
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
      <CompatRoute path="/sensor/:location_id/tasks" exact children={<LocationTasks />} />
      <CompatRoute path="/sensor/:location_id/readings" exact children={<SensorReadings />} />
      <CompatRoute path="/sensor/:location_id/details" exact children={<SensorDetail />} />
      {isAdmin && (
        <CompatRoute path="/sensor/:location_id/edit" exact children={<UpdateSensor />} />
      )}
    </>
  );
}
