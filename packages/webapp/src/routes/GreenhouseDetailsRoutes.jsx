/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditGreenhouseDetailForm from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/EditGreenhouse';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/greenhouse/:location_id/details"
        exact
        children={<EditGreenhouseDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/greenhouse/:location_id/edit"
          exact
          children={<EditGreenhouseDetailForm />}
        />
      )}
      <CompatRoute
        path="/greenhouse/:location_id/crops"
        exact
        children={<LocationManagementPlan />}
      />
      <CompatRoute path="/greenhouse/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
