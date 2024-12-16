/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import EditGardenDetailForm from '../containers/LocationDetails/AreaDetails/GardenDetailForm/EditGarden';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GardenDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/garden/:location_id/details" exact children={<EditGardenDetailForm />} />
      {isAdmin && (
        <Route path="/garden/:location_id/edit" exact children={<EditGardenDetailForm />} />
      )}
      <Route path="/garden/:location_id/crops" exact children={<LocationManagementPlan />} />
      <Route path="/garden/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
