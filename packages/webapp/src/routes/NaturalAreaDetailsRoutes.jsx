/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditNaturalAreaDetailForm from '../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/EditNaturalArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function NaturalAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/natural_area/:location_id/details"
        exact
        children={<EditNaturalAreaDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/natural_area/:location_id/edit"
          exact
          children={<EditNaturalAreaDetailForm />}
        />
      )}
      <CompatRoute path="/natural_area/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
