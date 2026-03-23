/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function GardenDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/garden/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="garden" />}
      />
      {isAdmin && (
        <Route
          path="/garden/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="garden" />}
        />
      )}
      <Route path="/garden/:location_id/crops" exact children={<LocationManagementPlan />} />
      <Route path="/garden/:location_id/tasks" exact children={<LocationTasks />} />
      <Route
        path="/garden/:location_id/field_technology"
        exact
        children={<LocationFieldTechnology />}
      />
      <Route path="/garden/:location_id/irrigation" exact children={<LocationIrrigation />} />
    </>
  );
}
