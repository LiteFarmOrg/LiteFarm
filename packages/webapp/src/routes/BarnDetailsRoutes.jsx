import { Route } from 'react-router-dom';
import React from 'react';
import EditBarnDetailForm from '../containers/LocationDetails/AreaDetails/BarnDetailForm/EditBarn';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function BarnDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/barn/:location_id/details" exact component={EditBarnDetailForm} />
      {isAdmin && <Route path="/barn/:location_id/edit" exact component={EditBarnDetailForm} />}
      <Route path="/barn/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
