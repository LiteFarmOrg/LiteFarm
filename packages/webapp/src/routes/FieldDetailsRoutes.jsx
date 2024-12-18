/* eslint-disable react/no-children-prop */
import { Route } from 'react-router';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/field/:location_id/details" exact children={<EditFieldDetailForm />} />
      {isAdmin && (
        <Route path="/field/:location_id/edit" exact children={<EditFieldDetailForm />} />
      )}
      <Route path="/field/:location_id/tasks" exact children={<LocationTasks />} />
      <Route path="/field/:location_id/crops" exact children={<LocationManagementPlan />} />
    </>
  );
}
