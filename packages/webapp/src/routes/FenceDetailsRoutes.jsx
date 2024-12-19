/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditFenceDetailForm from '../containers/LocationDetails/LineDetails/FenceDetailForm/EditFence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function FenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute path="/fence/:location_id/details" exact children={<EditFenceDetailForm />} />
      {isAdmin && (
        <CompatRoute path="/fence/:location_id/edit" exact children={<EditFenceDetailForm />} />
      )}
      <CompatRoute path="/fence/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
