/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditResidenceDetailForm from '../containers/LocationDetails/AreaDetails/ResidenceDetailForm/EditResidence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function ResidenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/residence/:location_id/details"
        exact
        children={<EditResidenceDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/residence/:location_id/edit"
          exact
          children={<EditResidenceDetailForm />}
        />
      )}
      <CompatRoute path="/residence/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
