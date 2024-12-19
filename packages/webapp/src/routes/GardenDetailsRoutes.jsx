/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditGardenDetailForm from '../containers/LocationDetails/AreaDetails/GardenDetailForm/EditGarden';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GardenDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute path="/garden/:location_id/details" exact children={<EditGardenDetailForm />} />
      {isAdmin && (
        <CompatRoute path="/garden/:location_id/edit" exact children={<EditGardenDetailForm />} />
      )}
      <CompatRoute path="/garden/:location_id/crops" exact children={<LocationManagementPlan />} />
      <CompatRoute path="/garden/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
