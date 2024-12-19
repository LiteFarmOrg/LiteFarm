/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditSurfaceWaterDetailForm from '../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/EditSurfaceWater';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function SurfaceWaterDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/surface_water/:location_id/details"
        exact
        children={<EditSurfaceWaterDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/surface_water/:location_id/edit"
          exact
          children={<EditSurfaceWaterDetailForm />}
        />
      )}
      <CompatRoute path="/surface_water/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
