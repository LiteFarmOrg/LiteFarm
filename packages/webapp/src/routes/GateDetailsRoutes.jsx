/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function GateDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/gate/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="gate" />}
      />
      {isAdmin && (
        <Route
          path="/gate/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="gate" />}
        />
      )}
      <Route path="/gate/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
