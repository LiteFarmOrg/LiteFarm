/* eslint-disable react/no-children-prop */
import { Route } from 'react-router';
import EditResidenceDetailForm from '../containers/LocationDetails/AreaDetails/ResidenceDetailForm/EditResidence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function ResidenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/residence/:location_id/details" exact children={<EditResidenceDetailForm />} />
      {isAdmin && (
        <Route path="/residence/:location_id/edit" exact children={<EditResidenceDetailForm />} />
      )}
      <Route path="/residence/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
