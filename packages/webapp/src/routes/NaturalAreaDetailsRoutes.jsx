/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function NaturalAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/natural_area/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="natural_area" />}
      />
      {isAdmin && (
        <Route
          path="/natural_area/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="natural_area" />}
        />
      )}
      <Route path="/natural_area/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
