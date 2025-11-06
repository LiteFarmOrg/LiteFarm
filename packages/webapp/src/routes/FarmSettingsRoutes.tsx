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
import { Route, Switch, Redirect } from 'react-router-dom';
import { FarmSettingsProvider } from '../containers/Profile/FarmSettings/FarmSettingsContext';

const BasicProfile = React.lazy(() => import('../containers/Profile/FarmSettings/BasicProfile'));
const MarketDirectory = React.lazy(
  () => import('../containers/Profile/FarmSettings/MarketDirectory'),
);
const FarmAddons = React.lazy(() => import('../containers/Profile/FarmSettings/Addons'));

const FarmSettingsRoutes = () => (
  <FarmSettingsProvider>
    <Switch>
      <Route path="/farm_settings/basic_profile" exact>
        <BasicProfile />
      </Route>
      <Route path="/farm_settings/market_directory" exact>
        <MarketDirectory />
      </Route>
      <Route path="/farm_settings/addons" exact>
        <FarmAddons />
      </Route>
      {/* Load on basic_profile */}
      <Route path="/farm_settings" exact>
        <Redirect to="/farm_settings/basic_profile" />
      </Route>
      {/* Redirect on non-matches */}
      <Route render={() => <Redirect to={'/'} />} />
    </Switch>
  </FarmSettingsProvider>
);

export default FarmSettingsRoutes;
