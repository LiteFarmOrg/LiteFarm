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

import { useHistory } from 'react-router-dom';
import SurveyComponent from '../../../components/SurveyComponent';
import surveyJson from './tapeQuestions.json';
import CardLayout from '../../../components/Layout/CardLayout';

function TAPESurvey() {
  const history = useHistory();

  // TODO: Prepare prepopulated data
  const prepopulatedData = {
    // Country
    // Lat / Lng
    // Do you raise animals
    // Number of unique species in crop management plans
  };

  const handleComplete = (surveyData: any) => {
    history.push('/survey/tape/results', { surveyData });
  };

  return (
    <CardLayout>
      <SurveyComponent
        surveyJson={surveyJson}
        onComplete={handleComplete}
        initialData={prepopulatedData}
      />
    </CardLayout>
  );
}

export default TAPESurvey;
