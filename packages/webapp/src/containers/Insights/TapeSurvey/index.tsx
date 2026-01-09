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

import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  saveSurveyProgress,
  completeSurvey,
  tapeSurveyDataSelector,
  tapeSurveyCurrentPageNoSelector,
} from './tapeSurveySlice';
import SurveyComponent from '../../../components/SurveyComponent';
import surveyJson from './tapeQuestions.json';
import PageTitle from '../../../components/PageTitle';

function TAPESurvey() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  // TODO LF-5109: Prepare prepopulated data
  const prepopulatedData = {
    // Country
    // Lat / Lng
    // Do you raise animals
    // Number of unique species in crop management plans
  };

  const savedData = useSelector(tapeSurveyDataSelector);
  const savedPageNo = useSelector(tapeSurveyCurrentPageNoSelector);

  const initialData = { ...prepopulatedData, ...savedData };

  const handleDataChange = (currentPageNo: number, surveyData: Record<string, any>) => {
    dispatch(saveSurveyProgress({ currentPageNo, surveyData }));
  };

  const handleComplete = (surveyData: any) => {
    history.push('/insights/tape/results', { surveyData });
  };

  return (
    <>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <SurveyComponent
        surveyJson={surveyJson}
        onComplete={handleComplete}
        onValueChanged={handleDataChange}
        initialData={initialData}
        initialPageNo={savedPageNo}
      />
    </>
  );
}

export default TAPESurvey;
