import { Route, Routes } from 'react-router-dom';
import EditBufferZoneDetailForm from '../containers/LocationDetails/LineDetails/BufferZoneDetailForm/EditBufferZone';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';

export default function BufferZoneDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <Routes>
      <Route path="details" element={<EditBufferZoneDetailForm />} />
      {isAdmin && <Route path="edit" element={<EditBufferZoneDetailForm />} />}
      <Route path="crops" element={<LocationManagementPlan />} />
      <Route path="tasks" element={<LocationTasks />} />
      <Route path="field_technology" element={<LocationFieldTechnology />} />
      <Route path="irrigation" element={<LocationIrrigation />} />
    </Routes>
  );
}
