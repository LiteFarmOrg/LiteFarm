import { Route, Routes } from 'react-router-dom';
import EditCeremonialAreaForm from '../containers/LocationDetails/AreaDetails/CeremonialAreaDetailForm/EditCeremonialArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function CeremonialAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditCeremonialAreaForm />} />
      {isAdmin && <Route path="edit" element={<EditCeremonialAreaForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
