/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import EditWaterValveDetailForm from '../containers/LocationDetails/PointDetails/WaterValveDetailForm/EditWaterValve';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WaterValveDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/water_valve/:location_id/details"
        exact
        children={<EditWaterValveDetailForm />}
      />
      {isAdmin && (
        <Route
          path="/water_valve/:location_id/edit"
          exact
          children={<EditWaterValveDetailForm />}
        />
      )}
      <Route path="/water_valve/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
