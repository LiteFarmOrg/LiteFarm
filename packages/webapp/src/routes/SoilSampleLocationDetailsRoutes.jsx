/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable react/no-children-prop */
import { Route } from 'react-router-dom';
import EditSoilSampleLocationDetailForm from '../containers/LocationDetails/PointDetails/SoilSampleLocationDetailForm/EditSoilSampleLocation';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';

export default function SoilSampleLocationDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route
        path="/soil_sample_location/:location_id/details"
        exact
        children={<EditSoilSampleLocationDetailForm />}
      />
      {isAdmin && (
        <Route
          path="/soil_sample_location/:location_id/edit"
          exact
          children={<EditSoilSampleLocationDetailForm />}
        />
      )}
      <Route path="/soil_sample_location/:location_id/tasks" exact children={<LocationTasks />} />
    </>
  );
}
