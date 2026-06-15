/*
 *  Copyright 2026 LiteFarm.org
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
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';
import LocationTasks from '../containers/LocationDetails/LocationTasks';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import LocationFieldTechnology from '../containers/LocationDetails/LocationFieldTechnology';
import LocationIrrigation from '../containers/LocationDetails/LocationIrrigation';
import EditLocationDetailForm from '../containers/LocationDetails/EditLocationDetailForm';
import { locationRouteConfig } from './locationRouteConfig';

export default function LocationDetailsRoutes({ locationType }) {
  const isAdmin = useSelector(isAdminSelector);
  const config = locationRouteConfig[locationType];

  if (!config) {
    return null;
  }

  const prefix = `/${locationType}/:location_id`;

  return (
    <>
      <Route
        path={`${prefix}/details`}
        exact
        children={<EditLocationDetailForm locationType={locationType} />}
      />
      {isAdmin && (
        <Route
          path={`${prefix}/edit`}
          exact
          children={<EditLocationDetailForm locationType={locationType} />}
        />
      )}

      {config.enabledTabs.includes('tasks') && (
        <Route path={`${prefix}/tasks`} exact children={<LocationTasks />} />
      )}

      {config.enabledTabs.includes('crops') && (
        <Route path={`${prefix}/crops`} exact children={<LocationManagementPlan />} />
      )}

      {config.enabledTabs.includes('field_technology') && (
        <Route path={`${prefix}/field_technology`} exact children={<LocationFieldTechnology />} />
      )}

      {config.enabledTabs.includes('irrigation') && (
        <Route path={`${prefix}/irrigation`} exact children={<LocationIrrigation />} />
      )}
    </>
  );
}
