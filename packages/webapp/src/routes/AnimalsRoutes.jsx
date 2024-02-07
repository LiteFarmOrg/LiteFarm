/*
 *  Copyright 2023 LiteFarm.org
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

import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import {
  ANIMALS_INVENTORY_URL,
  ANIMALS_LOCATION_URL,
  ANIMALS_GROUPS_URL,
} from '../util/siteMapConstants';
const Inventory = React.lazy(() => import('../containers/Animals/Inventory'));
const Location = React.lazy(() => import('../containers/Animals/Location'));
const Groups = React.lazy(() => import('../containers/Animals/Groups'));

const AnimalsRoutes = () => (
  <Switch>
    <Route path={ANIMALS_INVENTORY_URL} exact component={Inventory} />
    <Route path={ANIMALS_LOCATION_URL} exact component={Location} />
    <Route path={ANIMALS_GROUPS_URL} exact component={Groups} />
  </Switch>
);

export default AnimalsRoutes;
