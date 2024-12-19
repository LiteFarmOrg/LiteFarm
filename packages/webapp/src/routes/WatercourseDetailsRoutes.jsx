/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import EditWatercourseDetailForm from '../containers/LocationDetails/LineDetails/WatercourseDetailForm/EditWatercourse';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function WatercourseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <CompatRoute
        path="/watercourse/:location_id/details"
        exact
        children={<EditWatercourseDetailForm />}
      />
      {isAdmin && (
        <CompatRoute
          path="/watercourse/:location_id/edit"
          exact
          children={<EditWatercourseDetailForm />}
        />
      )}
      <CompatRoute path="/watercourse/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
