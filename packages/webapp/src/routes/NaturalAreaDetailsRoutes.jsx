import { Route } from 'react-router-dom';
import React from 'react';
import EditNaturalAreaDetailForm from '../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/EditNaturalArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function NaturalAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/natural_area/:location_id/details"
        exact
        component={EditNaturalAreaDetailForm}
      />
      {isAdmin && (
        <Route path="/natural_area/:location_id/edit" exact component={EditNaturalAreaDetailForm} />
      )}
      <Route path="/natural_area/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
