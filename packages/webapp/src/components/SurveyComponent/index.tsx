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

import { useCallback, useEffect, useRef, useState } from 'react';
import { Model, SurveyModel } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { DefaultLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';

const createSurveyAndInitialData = (
  surveyJson: any,
  initialData?: Record<string, any>,
  initialPageNo?: number,
) => {
  const survey = new Model(surveyJson);
  survey.applyTheme(DefaultLight);

  // Set initial data if provided
  if (initialData) {
    survey.data = initialData;
  }
  // Set initial page if provided
  if (initialPageNo && initialPageNo > 0) {
    survey.currentPageNo = initialPageNo;
  }
  console.log('rerun');

  return survey;
};

interface SurveyComponentProps {
  surveyJson: Readonly<any>; // Survey JSON schema object
  onComplete: (currentPageNo: number, surveyData: any) => void;
  initialData?: Record<string, any>;
  initialPageNo?: number;
  onCurrentPageChanged?: (currentPageNo: number, surveyData: Record<string, any>) => void;
  onValueChanged?: (currentPageNo: number, surveyData: Record<string, any>) => void;
}

const extractSurveyState = (model: Model) => ({
  currentPageNo: model.currentPageNo,
  surveyData: model.data,
});

export default function SurveyComponent({
  surveyJson,
  onComplete,
  initialData,
  initialPageNo = 0,
  onCurrentPageChanged,
  onValueChanged,
}: SurveyComponentProps) {
  console.time('survey');
  // Use Ref to create the survey model only once, even as saved data changes and component re-renders
  const [survey, _setSurvey] = useState(() =>
    createSurveyAndInitialData(surveyJson, initialData, initialPageNo),
  );

  // https://surveyjs.io/form-library/documentation/get-started-react
  const handleComplete = useCallback(
    (surveyModel: Model) => {
      const { currentPageNo, surveyData } = extractSurveyState(surveyModel);
      onComplete(currentPageNo, surveyData);
    },
    [onComplete],
  );

  const handleCurrentPageChanged = useCallback(
    (surveyModel: Model) => {
      const { currentPageNo, surveyData } = extractSurveyState(surveyModel);
      onCurrentPageChanged?.(currentPageNo, surveyData);
    },
    [onCurrentPageChanged],
  );

  const handleValueChanged = useCallback(
    (surveyModel: Model) => {
      const { currentPageNo, surveyData } = extractSurveyState(surveyModel);
      onValueChanged?.(currentPageNo, surveyData);
    },
    [onValueChanged],
  );

  useEffect(() => {
    survey.onComplete.add(handleComplete);

    if (onCurrentPageChanged) {
      survey.onCurrentPageChanged.add(handleCurrentPageChanged);
    }

    if (onValueChanged) {
      survey.onValueChanged.add(handleValueChanged);
    }
    console.log('added listeners');

    return () => {
      survey.onComplete.remove(handleComplete);

      if (onCurrentPageChanged) {
        survey.onCurrentPageChanged.remove(handleCurrentPageChanged);
      }

      if (onValueChanged) {
        survey.onValueChanged.remove(handleValueChanged);
      }
      console.log('destroyed listeners');
    };
  }, [survey, handleComplete, handleCurrentPageChanged, handleValueChanged]);
  console.timeEnd('survey');
  return <Survey model={survey} />;
}
