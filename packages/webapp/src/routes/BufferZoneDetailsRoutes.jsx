/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditBufferZoneDetailForm from '../containers/LocationDetails/LineDetails/BufferZoneDetailForm/EditBufferZone';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function BufferZoneDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/buffer_zone/:location_id/details"
        exact
        children={<EditBufferZoneDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/buffer_zone/:location_id/edit"
          exact
          children={<EditBufferZoneDetailForm />}
        />
      )}
      <CompatRoute
        path="/buffer_zone/:location_id/crops"
        exact
        children={<LocationManagementPlan />}
      />
      <CompatRoute path="/buffer_zone/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
