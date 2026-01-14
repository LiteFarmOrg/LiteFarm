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
import { Route, Routes } from 'react-router-dom';
const Inventory = React.lazy(() => import('../containers/Animals/Inventory'));
const AddAnimals = React.lazy(() => import('../containers/Animals/AddAnimals'));
const SingleAnimalView = React.lazy(() => import('../containers/Animals/SingleAnimalView'));
// const SingleAnimalTasks = React.lazy(() =>
//   import('../containers/Animals/SingleAnimalView/AnimalTasks'),
// );

const AnimalsRoutes = ({ isCompactSideMenu }) => (
  <Routes>
    <Route path="inventory" element={<Inventory isCompactSideMenu={isCompactSideMenu} />} />
    <Route
      path="inventory/add_animals"
      element={<AddAnimals isCompactSideMenu={isCompactSideMenu} />}
    />
    <Route path=":id" element={<SingleAnimalView isCompactSideMenu={isCompactSideMenu} />} />
    {/* Temporarily removed for Animals v1 release */}
    {/* <Route path=":id/tasks" element={<SingleAnimalTasks isCompactSideMenu={isCompactSideMenu} />} /> */}
  </Routes>
);

export default AnimalsRoutes;
