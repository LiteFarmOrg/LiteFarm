import { Route } from 'react-router-dom';
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
    <>
      <Route path="/buffer_zone/:location_id/details" exact component={EditBufferZoneDetailForm} />
      {isAdmin && (
        <Route path="/buffer_zone/:location_id/edit" exact component={EditBufferZoneDetailForm} />
      )}
      <Route path="/buffer_zone/:location_id/crops" exact component={LocationManagementPlan} />
      <Route path="/buffer_zone/:location_id/tasks" exact component={LocationTasks} />
      <Route
        path="/buffer_zone/:location_id/field_technology"
        exact
        component={LocationFieldTechnology}
      />
      <Route path="/buffer_zone/:location_id/irrigation" exact component={LocationIrrigation} />
    </>
  );
}
