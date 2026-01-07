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

import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

const TAPESurvey = React.lazy(() => import('../containers/Survey/TapeSurvey'));
const TAPEResults = React.lazy(() => import('../containers/Survey/TapeSurvey/TapeResults'));

const SurveyRoutes = () => (
  <Switch>
    <Route path="/survey/tape" exact children={<TAPESurvey />} />
    <Route path="/survey/tape/results" exact children={<TAPEResults />} />
    <Route path="/survey" exact>
      {/* Temporary redirect until more surveys exist and we create a list page*/}
      <Redirect to="/survey/tape" />
    </Route>
    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default SurveyRoutes;
