import { Route, Routes } from 'react-router-dom';
import EditFarmSiteBoundaryDetailForm from '../containers/LocationDetails/AreaDetails/FarmSiteBoundaryDetailForm/EditFarmSiteBoundary';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function FarmSiteBoundaryDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditFarmSiteBoundaryDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditFarmSiteBoundaryDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
      <Route path="field_technology" element={<LocationFieldTechnology />} />
      <Route path="irrigation" element={<LocationIrrigation />} />
    </Routes>
  );
}
