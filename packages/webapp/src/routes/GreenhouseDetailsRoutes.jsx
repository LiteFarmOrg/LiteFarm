/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/greenhouse/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="greenhouse" />}
      />
      {isAdmin && (
        <Route
          path="/greenhouse/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="greenhouse" />}
        />
      )}
      <Route path="/greenhouse/:location_id/crops" exact children={<LocationManagementPlan />} />
      <Route path="/greenhouse/:location_id/tasks" exact children={<LocationTasks />} />
      <Route
        path="/greenhouse/:location_id/field_technology"
        exact
        children={<LocationFieldTechnology />}
      />
      <Route path="/greenhouse/:location_id/irrigation" exact children={<LocationIrrigation />} />
    </>
  );
}
