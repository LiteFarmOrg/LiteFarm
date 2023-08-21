import { Route } from 'react-router-dom';
import React from 'react';
import EditCeremonialAreaForm from '../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/EditCeremonialArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function CeremonialAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/ceremonial_area/:location_id/details"
        exact
        component={EditCeremonialAreaForm}
      />
      {isAdmin && (
        <Route path="/ceremonial_area/:location_id/edit" exact component={EditCeremonialAreaForm} />
      )}
      <Route path="/ceremonial_area/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
