/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function CeremonialAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/ceremonial_area/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="ceremonial_area" />}
      />
      {isAdmin && (
        <Route
          path="/ceremonial_area/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="ceremonial_area" />}
        />
      )}
      <Route path="/ceremonial_area/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
