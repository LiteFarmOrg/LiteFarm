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

import { useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';

interface SurveyComponentProps {
  surveyJson: any; // Survey JSON schema object
  onComplete: (surveyData: any) => void;
  initialData?: Record<string, any>;
}

export default function SurveyComponent({
  surveyJson,
  onComplete,
  initialData,
}: SurveyComponentProps) {
  const survey = new Model(surveyJson);

  survey.applyTheme(DefaultLight);

  // Set initial data if provided
  if (initialData) {
    survey.data = initialData;
  }

  // https://surveyjs.io/form-library/documentation/get-started-react
  const handleComplete = useCallback(
    (surveyModel: Model) => {
      const surveyData = surveyModel.data;
      onComplete(surveyData);
    },
    [onComplete],
  );

  survey.onComplete.add(handleComplete);

  return <Survey model={survey} />;
}
