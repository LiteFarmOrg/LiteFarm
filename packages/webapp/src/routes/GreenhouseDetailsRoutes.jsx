import { Route, Routes } from 'react-router-dom';
import EditGreenhouseDetailForm from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/EditGreenhouse';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditGreenhouseDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditGreenhouseDetailForm />} />}
      <Route path="crops" element={<LocationManagementPlan />} />
      <Route path="tasks" element={<LocationTasks />} />
      <Route path="field_technology" element={<LocationFieldTechnology />} />
      <Route path="irrigation" element={<LocationIrrigation />} />
    </Routes>
  );
}
