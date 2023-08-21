import { Route } from 'react-router-dom';
import React from 'react';
import EditSurfaceWaterDetailForm from '../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/EditSurfaceWater';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function SurfaceWaterDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/surface_water/:location_id/details"
        exact
        component={EditSurfaceWaterDetailForm}
      />
      {isAdmin && (
        <Route
          path="/surface_water/:location_id/edit"
          exact
          component={EditSurfaceWaterDetailForm}
        />
      )}
      <Route path="/surface_water/:location_id/tasks" exact component={LocationTasks} />
    </>
  );
}
