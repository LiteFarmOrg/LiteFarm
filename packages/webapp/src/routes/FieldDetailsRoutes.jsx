/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute path="/field/:location_id/details" exact children={<EditFieldDetailForm />} />
      {isAdmin && (
        <CompatRoute path="/field/:location_id/edit" exact children={<EditFieldDetailForm />} />
      )}
      <CompatRoute path="/field/:location_id/tasks" exact children={<LocationTasks />} />
      <CompatRoute path="/field/:location_id/crops" exact children={<LocationManagementPlan />} />
    </>
  );
}
