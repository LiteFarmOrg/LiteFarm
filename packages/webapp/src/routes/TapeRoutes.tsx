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
import { Redirect, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSurveyVersion } from '../containers/Insights/TapeSurvey/getSurveyVersion';
import { userFarmSelector } from '../containers/userFarmSlice';

const TapeSurvey = React.lazy(() => import('../containers/Insights/TapeSurvey'));
const TapeResults = React.lazy(() => import('../containers/Insights/TapeSurvey/TapeResults'));

const TapeRoutes = ({ isCompactSideMenu }: { isCompactSideMenu: boolean }) => {
  // @ts-expect-error -- userFarmSelector issue
  const { country_code } = useSelector(userFarmSelector);
  const surveyVersion = getSurveyVersion(country_code);

  if (!surveyVersion) {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/insights/tape" exact>
        <TapeSurvey isCompactSideMenu={isCompactSideMenu} surveyVersion={surveyVersion} />
      </Route>
      <Route path="/insights/tape/results" exact>
        <TapeResults surveyVersion={surveyVersion} />
      </Route>
      <Route render={() => <Redirect to="/" />} />
    </Switch>
  );
};

export default TapeRoutes;
