import { Route } from 'react-router-dom';
import React from 'react';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function SensorDetailsRoutes() {
  return (
    <>
      <Route path="/sensor/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
