import { Route, Routes } from 'react-router-dom';
import EditFenceDetailForm from '../containers/LocationDetails/LineDetails/FenceDetailForm/EditFence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function FenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditFenceDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditFenceDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
