/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditWaterValveDetailForm from '../containers/LocationDetails/PointDetails/WaterValveDetailForm/EditWaterValve';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WaterValveDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/water_valve/:location_id/details"
        exact
        children={<EditWaterValveDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/water_valve/:location_id/edit"
          exact
          children={<EditWaterValveDetailForm />}
        />
      )}
      <CompatRoute path="/water_valve/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
