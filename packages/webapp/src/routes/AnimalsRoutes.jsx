/*
 *  Copyright 2024 LiteFarm.org
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
import { Route, Switch } from 'react-router-dom';
import {
  ANIMALS_INVENTORY_URL,
  ANIMALS_LOCATION_URL,
  ANIMALS_GROUPS_URL,
  ADD_ANIMALS_URL,
  createSingleAnimalViewURL,
  // createSingleAnimalTasksURL,
} from '../util/siteMapConstants';
const Inventory = React.lazy(() => import('../containers/Animals/Inventory'));
const Location = React.lazy(() => import('../containers/Animals/Location'));
const Groups = React.lazy(() => import('../containers/Animals/Groups'));
const AddAnimals = React.lazy(() => import('../containers/Animals/AddAnimals'));
const SingleAnimalView = React.lazy(() => import('../containers/Animals/SingleAnimalView'));
// const SingleAnimalTasks = React.lazy(() =>
//   import('../containers/Animals/SingleAnimalView/AnimalTasks'),
// );

const AnimalsRoutes = ({ isCompactSideMenu }) => (
  <Switch>
    <Route
      path={ANIMALS_INVENTORY_URL}
      exact
      render={(props) => <Inventory isCompactSideMenu={isCompactSideMenu} {...props} />}
    />
    <Route path={ANIMALS_LOCATION_URL} exact component={Location} />
    <Route path={ANIMALS_GROUPS_URL} exact component={Groups} />
    <Route
      path={ADD_ANIMALS_URL}
      exact
      render={(props) => <AddAnimals isCompactSideMenu={isCompactSideMenu} {...props} />}
    />
    <Route
      path={createSingleAnimalViewURL(':id')}
      exact
      render={(props) => <SingleAnimalView isCompactSideMenu={isCompactSideMenu} {...props} />}
    />
    {/* Temporarily removed for Animals v1 release */}
    {/* <Route
      path={createSingleAnimalTasksURL(':id')}
      exact
      render={(props) => <SingleAnimalTasks isCompactSideMenu={isCompactSideMenu} {...props} />}
    /> */}
  </Switch>
);

export default AnimalsRoutes;
