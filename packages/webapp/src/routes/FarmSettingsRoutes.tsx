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

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { FarmSettingsProvider } from '../containers/Profile/FarmSettings/FarmSettingsContext';

const BasicProfile = React.lazy(() => import('../containers/Profile/FarmSettings/BasicProfile'));
const MarketDirectory = React.lazy(
  () => import('../containers/Profile/FarmSettings/MarketDirectory'),
);
const FarmAddons = React.lazy(() => import('../containers/Profile/FarmSettings/Addons'));

const FarmSettingsRoutes = () => (
  <Routes>
    <Route
      path="/basic_profile"
      element={
        <FarmSettingsProvider>
          <BasicProfile />
        </FarmSettingsProvider>
      }
    />
    <Route
      path="/market_directory"
      element={
        <FarmSettingsProvider>
          <MarketDirectory />
        </FarmSettingsProvider>
      }
    />
    <Route
      path="/addons"
      element={
        <FarmSettingsProvider>
          <FarmAddons />
        </FarmSettingsProvider>
      }
    />
    {/* Load on basic_profile */}
    <Route path="/" element={<Navigate to="basic_profile" />} />
    {/* Redirect on non-matches */}
    <Route path="*" element={<Navigate to={'/'} />} />
  </Routes>
);

export default FarmSettingsRoutes;
