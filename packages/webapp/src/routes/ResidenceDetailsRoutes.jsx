import { Route, Routes } from 'react-router-dom';
import EditResidenceDetailForm from '../containers/LocationDetails/AreaDetails/ResidenceDetailForm/EditResidence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function ResidenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditResidenceDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditResidenceDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
