/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditBarnDetailForm from '../containers/LocationDetails/AreaDetails/BarnDetailForm/EditBarn';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function BarnDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute path="/barn/:location_id/details" exact children={<EditBarnDetailForm />} />
      {isAdmin && (
        <CompatRoute path="/barn/:location_id/edit" exact children={<EditBarnDetailForm />} />
      )}
      <CompatRoute path="/barn/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
