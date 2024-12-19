/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditCeremonialAreaForm from '../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/EditCeremonialArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function CeremonialAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/ceremonial_area/:location_id/details"
        exact
        children={<EditCeremonialAreaForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/ceremonial_area/:location_id/edit"
          exact
          children={<EditCeremonialAreaForm />}
        />
      )}
      <CompatRoute path="/ceremonial_area/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
