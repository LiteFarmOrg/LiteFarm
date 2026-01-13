import { Route, Routes } from 'react-router-dom';
import EditNaturalAreaDetailForm from '../containers/LocationDetails/AreaDetails/NaturalAreaDetailForm/EditNaturalArea';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function NaturalAreaDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditNaturalAreaDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditNaturalAreaDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
