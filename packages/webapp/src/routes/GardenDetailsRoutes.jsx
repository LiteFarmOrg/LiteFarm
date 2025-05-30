import { Route } from 'react-router-dom';
import EditGardenDetailForm from '../containers/LocationDetails/AreaDetails/GardenDetailForm/EditGarden';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function GardenDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/garden/:location_id/details" exact component={EditGardenDetailForm} />
      {isAdmin && <Route path="/garden/:location_id/edit" exact component={EditGardenDetailForm} />}
      <Route path="/garden/:location_id/crops" exact component={LocationManagementPlan} />
      <Route path="/garden/:location_id/tasks" exact component={LocationTasks} />
      <Route
        path="/garden/:location_id/field_technology"
        exact
        component={LocationFieldTechnology}
      />
      <Route path="/garden/:location_id/irrigation" exact component={LocationIrrigation} />
    </>
  );
}
