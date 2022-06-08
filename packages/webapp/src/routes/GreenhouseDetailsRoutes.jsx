import { Route } from 'react-router-dom';
import React from 'react';
import EditGreenhouseDetailForm from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/EditGreenhouse';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/greenhouse/:location_id/details" exact component={EditGreenhouseDetailForm} />
      {isAdmin && (
        <Route path="/greenhouse/:location_id/edit" exact component={EditGreenhouseDetailForm} />
      )}
      <Route path="/greenhouse/:location_id/crops" exact component={LocationManagementPlan} />
      <Route path="/greenhouse/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
