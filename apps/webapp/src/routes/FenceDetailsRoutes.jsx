import { Route } from 'react-router-dom';
import React from 'react';
import EditFenceDetailForm from '../containers/LocationDetails/LineDetails/FenceDetailForm/EditFence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function FenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/fence/:location_id/details" exact component={EditFenceDetailForm} />
      {isAdmin && <Route path="/fence/:location_id/edit" exact component={EditFenceDetailForm} />}
      <Route path="/fence/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
