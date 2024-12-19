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

/* eslint-disable react/no-children-prop */
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import {
  ANIMALS_INVENTORY_URL,
  ADD_ANIMALS_URL,
  createSingleAnimalViewURL,
} from '../util/siteMapConstants';
const Inventory = React.lazy(() => import('../containers/Animals/Inventory'));
const AddAnimals = React.lazy(() => import('../containers/Animals/AddAnimals'));
const SingleAnimalView = React.lazy(() => import('../containers/Animals/SingleAnimalView'));

const AnimalsRoutes = ({ isCompactSideMenu, setFeedbackSurveyOpen }) => (
  <Switch>
    <CompatRoute path={ANIMALS_INVENTORY_URL} exact>
      <Inventory
        isCompactSideMenu={isCompactSideMenu}
        setFeedbackSurveyOpen={setFeedbackSurveyOpen}
      />
    </CompatRoute>
    <CompatRoute path={ADD_ANIMALS_URL} exact>
      <AddAnimals isCompactSideMenu={isCompactSideMenu} />
    </CompatRoute>
    <CompatRoute path={createSingleAnimalViewURL(':id')} exact>
      <SingleAnimalView isCompactSideMenu={isCompactSideMenu} />
    </CompatRoute>
  </Switch>
);

export default AnimalsRoutes;
