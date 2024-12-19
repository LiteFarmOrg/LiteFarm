/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditFarmSiteBoundaryDetailForm from '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/EditFarmSiteBoundary';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function FarmSiteBoundaryDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/farm_site_boundary/:location_id/details"
        exact
        children={<EditFarmSiteBoundaryDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/farm_site_boundary/:location_id/edit"
          exact
          children={<EditFarmSiteBoundaryDetailForm />}
        />
      )}
      <CompatRoute
        path="/farm_site_boundary/:location_id/tasks"
        exact
        children={<LocationTasks />}
      />
    </>
  );
}
