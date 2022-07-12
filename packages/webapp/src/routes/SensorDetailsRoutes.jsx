import { Route } from 'react-router-dom';
import React from 'react';
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
      <Route path="/sensor/:location_id/tasks" exact component={LocationTasks} />
      <Route path="/sensor/:location_id/readings" exact component={SensorReadings} />
      <Route path="/sensor/:location_id/details" exact component={SensorDetail} />
      {isAdmin && <Route path="/sensor/:location_id/edit" exact component={UpdateSensor} />}
    </>
  );
}
