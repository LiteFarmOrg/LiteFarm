/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditGateDetailForm from '../containers/LocationDetails/PointDetails/GateDetailForm/EditGate';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GateDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute path="/gate/:location_id/details" exact children={<EditGateDetailForm />} />
      {isAdmin && (
        <CompatRoute path="/gate/:location_id/edit" exact children={<EditGateDetailForm />} />
      )}
      <CompatRoute path="/gate/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
