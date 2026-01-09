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

import { useCallback, useMemo } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';

interface SurveyComponentProps {
  surveyJson: any; // Survey JSON schema object
  onComplete: (surveyData: any) => void;
  initialData?: Record<string, any>;
  initialPageNo?: number;
  onCurrentPageChanged?: (currentPageNo: number, surveyData: Record<string, any>) => void;
  onValueChanged?: (currentPageNo: number, surveyData: Record<string, any>) => void;
}

export default function SurveyComponent({
  surveyJson,
  onComplete,
  initialData,
  initialPageNo = 0,
  onCurrentPageChanged,
  onValueChanged,
}: SurveyComponentProps) {
  // Memoize to create the survey model only once, even as saved data changes and component re-renders
  const survey = useMemo(() => {
    const model = new Model(surveyJson);

    model.applyTheme(DefaultLight);

    // Set initial data if provided
    if (initialData) {
      model.data = initialData;
    }

    // Set initial page if provided
    if (initialPageNo > 0) {
      model.currentPageNo = initialPageNo;
    }

    return model;
  }, [surveyJson]);

  // https://surveyjs.io/form-library/documentation/get-started-react
  const handleComplete = useCallback(
    (surveyModel: Model) => {
      const surveyData = surveyModel.data;
      onComplete(surveyData);
    },
    [onComplete],
  );

  const handleCurrentPageChanged = useCallback(
    (surveyModel: Model) => {
      const currentPageNo = surveyModel.currentPageNo;
      const surveyData = surveyModel.data;
      onCurrentPageChanged?.(currentPageNo, surveyData);
    },
    [onCurrentPageChanged],
  );

  const handleValueChanged = useCallback(
    (surveyModel: Model) => {
      const currentPageNo = surveyModel.currentPageNo;
      const surveyData = surveyModel.data;
      onValueChanged?.(currentPageNo, surveyData);
    },
    [onValueChanged],
  );

  survey.onComplete.add(handleComplete);

  if (onCurrentPageChanged) {
    survey.onCurrentPageChanged.add(handleCurrentPageChanged);
  }

  if (onValueChanged) {
    survey.onValueChanged.add(handleValueChanged);
  }

  return <Survey model={survey} />;
}
