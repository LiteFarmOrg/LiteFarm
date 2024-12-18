/* eslint-disable react/no-children-prop */
import { Route } from 'react-router';
import EditFenceDetailForm from '../containers/LocationDetails/LineDetails/FenceDetailForm/EditFence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function FenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/fence/:location_id/details" exact children={<EditFenceDetailForm />} />
      {isAdmin && (
        <Route path="/fence/:location_id/edit" exact children={<EditFenceDetailForm />} />
      )}
      <Route path="/fence/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
