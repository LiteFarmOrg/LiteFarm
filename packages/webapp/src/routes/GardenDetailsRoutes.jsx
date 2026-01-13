import { Route, Routes } from 'react-router-dom';
import EditGardenDetailForm from '../containers/LocationDetails/AreaDetails/GardenDetailForm/EditGarden';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function GardenDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditGardenDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditGardenDetailForm />} />}
      <Route path="crops" element={<LocationManagementPlan />} />
      <Route path="tasks" element={<LocationTasks />} />
      <Route path="field_technology" element={<LocationFieldTechnology />} />
      <Route path="irrigation" element={<LocationIrrigation />} />
    </Routes>
  );
}
