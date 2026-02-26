import { Route, Routes } from 'react-router-dom';
import EditBarnDetailForm from '../containers/LocationDetails/AreaDetails/BarnDetailForm/EditBarn';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function BarnDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="/details" element={<EditBarnDetailForm />} />
      {isAdmin && <Route path="/edit" element={<EditBarnDetailForm />} />}
      <Route path="/tasks" element={<LocationTasks />} />
    </Routes>
  );
}
