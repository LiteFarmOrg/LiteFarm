import { Route } from 'react-router-dom';
import React from 'react';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/field/:location_id/details" exact component={EditFieldDetailForm} />
      {isAdmin && <Route path="/field/:location_id/edit" exact component={EditFieldDetailForm} />}
      <Route path="/field/:location_id/tasks" exact component={LocationTasks} />
      <Route path="/field/:location_id/crops" exact component={LocationManagementPlan} />
    </>
  );
}
