import { Route, Routes } from 'react-router-dom';
import EditSurfaceWaterDetailForm from '../containers/LocationDetails/AreaDetails/SurfaceWaterDetailForm/EditSurfaceWater';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function SurfaceWaterDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditSurfaceWaterDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditSurfaceWaterDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
