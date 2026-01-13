import { Route, Routes } from 'react-router-dom';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditFieldDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditFieldDetailForm />} />}
      <Route path="tasks" element={<LocationTasks />} />
      <Route path="crops" element={<LocationManagementPlan />} />
      <Route path="field_technology" element={<LocationFieldTechnology />} />
      <Route path="irrigation" element={<LocationIrrigation />} />
    </Routes>
  );
}
