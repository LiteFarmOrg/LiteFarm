/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import EditGreenhouseDetailForm from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/EditGreenhouse';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/greenhouse/:location_id/details"
        exact
        children={<EditGreenhouseDetailForm />}
      />
      {isAdmin && (
        <Route path="/greenhouse/:location_id/edit" exact children={<EditGreenhouseDetailForm />} />
      )}
      <Route path="/greenhouse/:location_id/crops" exact children={<LocationManagementPlan />} />
      <Route path="/greenhouse/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
