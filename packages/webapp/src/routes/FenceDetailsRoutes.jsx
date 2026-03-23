/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function FenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/fence/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="fence" />}
      />
      {isAdmin && (
        <Route
          path="/fence/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="fence" />}
        />
      )}
      <Route path="/fence/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
