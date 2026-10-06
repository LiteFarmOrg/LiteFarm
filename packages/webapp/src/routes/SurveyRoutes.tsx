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

import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Survey from '../containers/Insights/Survey';
import { getResultsComponent } from '../containers/Insights/Survey/surveyConfig';

// Renders the results component the survey declares (or the generic thank-you page).
const SurveyResults = () => {
  const { surveyId = '' } = useParams();
  const ResultsComponent = getResultsComponent(surveyId);
  return <ResultsComponent surveyId={surveyId} />;
};

const SurveyRoutes = ({ isCompactSideMenu }: { isCompactSideMenu: boolean }) => {
  return (
    <Routes>
      <Route path="survey/:surveyId" element={<Survey isCompactSideMenu={isCompactSideMenu} />} />
      <Route path="survey/:surveyId/results" element={<SurveyResults />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default SurveyRoutes;
