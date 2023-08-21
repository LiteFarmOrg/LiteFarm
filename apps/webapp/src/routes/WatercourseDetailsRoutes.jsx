import { Route } from 'react-router-dom';
import React from 'react';
import EditWatercourseDetailForm from '../containers/LocationDetails/LineDetails/WatercourseDetailForm/EditWatercourse';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WatercourseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/watercourse/:location_id/details" exact component={EditWatercourseDetailForm} />
      {isAdmin && (
        <Route path="/watercourse/:location_id/edit" exact component={EditWatercourseDetailForm} />
      )}
      <Route path="/watercourse/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
