/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function WaterValveDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/water_valve/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="water_valve" />}
      />
      {isAdmin && (
        <Route
          path="/water_valve/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="water_valve" />}
        />
      )}
      <Route path="/water_valve/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
