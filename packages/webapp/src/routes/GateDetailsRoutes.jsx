/* eslint-disable react/no-children-prop */
import { Route } from 'react-router';
import EditGateDetailForm from '../containers/LocationDetails/PointDetails/GateDetailForm/EditGate';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GateDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/gate/:location_id/details" exact children={<EditGateDetailForm />} />
      {isAdmin && <Route path="/gate/:location_id/edit" exact children={<EditGateDetailForm />} />}
      <Route path="/gate/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
