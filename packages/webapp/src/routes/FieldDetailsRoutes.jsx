/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/field/:location_id/details"
        exact
        children={<EditLocationDetailForm locationType="field" />}
      />
      {isAdmin && (
        <Route
          path="/field/:location_id/edit"
          exact
          children={<EditLocationDetailForm locationType="field" />}
        />
      )}
      <Route path="/field/:location_id/tasks" exact children={<LocationTasks />} />
      <Route path="/field/:location_id/crops" exact children={<LocationManagementPlan />} />
      <Route
        path="/field/:location_id/field_technology"
        exact
        children={<LocationFieldTechnology />}
      />
      <Route path="/field/:location_id/irrigation" exact children={<LocationIrrigation />} />
    </>
  );
}
