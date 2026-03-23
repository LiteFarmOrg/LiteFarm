/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function SurfaceWaterDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/surface_water/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="surface_water" />}
      />
      {isAdmin && (
        <Route
          path="/surface_water/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="surface_water" />}
        />
      )}
      <Route path="/surface_water/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
