import { Route, Routes } from 'react-router-dom';
import EditWatercourseDetailForm from '../containers/LocationDetails/LineDetails/WatercourseDetailForm/EditWatercourse';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WatercourseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditWatercourseDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditWatercourseDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
    </Routes>
  );
}
