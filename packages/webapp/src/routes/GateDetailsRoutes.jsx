import { Route, Routes } from 'react-router-dom';
import EditGateDetailForm from '../containers/LocationDetails/PointDetails/GateDetailForm/EditGate';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function GateDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditGateDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditGateDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
