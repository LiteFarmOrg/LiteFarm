import { Route } from 'react-router-dom';
import React from 'react';
import EditFarmSiteBoundaryDetailForm from '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/EditFarmSiteBoundary';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function FarmSiteBoundaryDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/farm_site_boundary/:location_id/details"
        exact
        component={EditFarmSiteBoundaryDetailForm}
      />
      {isAdmin && (
        <Route
          path="/farm_site_boundary/:location_id/edit"
          exact
          component={EditFarmSiteBoundaryDetailForm}
        />
      )}
      <Route path="/farm_site_boundary/:location_id/tasks" exact component={LocationTasks} />
      <Route
        path="/farm_site_boundary/:location_id/field_technology"
        exact
        component={LocationFieldTechnology}
      />
      <Route
        path="/farm_site_boundary/:location_id/irrigation"
        exact
        component={LocationIrrigation}
      />
    </>
  );
}
