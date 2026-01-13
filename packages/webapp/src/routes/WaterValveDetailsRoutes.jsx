import { Route, Routes } from 'react-router-dom';
import EditWaterValveDetailForm from '../containers/LocationDetails/PointDetails/WaterValveDetailForm/EditWaterValve';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WaterValveDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditWaterValveDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditWaterValveDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
