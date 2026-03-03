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
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTapeSurveyPrepopulatedData } from './useTapeSurveyPrepopulatedData';
import { saveSurveyProgress, clearSurvey, tapeSurveySelector } from './tapeSurveySlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import { usePrefetch, useSubmitTapeSurveyMutation } from '../../../store/api/tapeSurveyApi';
import useTapeSurveyJsonForFarmCountry from './useTapeSurveyJsonForFarmCountry';
import { CompleteEvent } from 'survey-core';

function TAPESurvey() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } =
    useTapeSurveyPrepopulatedData();

  const {
    data: surveyJson,
    isLoading: isSurveyJsonLoading,
    isError: isSurveyJsonError,
  } = useTapeSurveyJsonForFarmCountry();

  const [submitTapeSurvey] = useSubmitTapeSurveyMutation();
  const prefetchSurveyData = usePrefetch('getTapeSurvey');

  const { surveyData: savedData, currentPageNo: savedPageNo } = useSelector(tapeSurveySelector);

  const initialData = { ...prepopulatedData, ...savedData };

  const handleDataChange = useCallback((currentPageNo: number, surveyData: Record<string, any>) => {
    dispatch(saveSurveyProgress({ currentPageNo, surveyData }));
  }, []);

  const handleComplete = useCallback(
    async (surveyData: any, options: CompleteEvent) => {
      try {
        await submitTapeSurvey({ survey_data: surveyData }).unwrap();
        prefetchSurveyData();
        dispatch(clearSurvey());
        history.push('/insights/tape/results');
      } catch {
        // TODO: handle error properly
        options.showSaveError();
      }
    },
    [submitTapeSurvey, dispatch, history, t],
  );

  const isLoading = isPrepopulatedDataLoading || isSurveyJsonLoading;

  if (isSurveyJsonError) {
    return (
      <>
        <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
        <p>{t('INSIGHTS.TAPE.LOAD_ERROR')}</p>
      </>
    );
  }

  return (
    <>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      {!isLoading && surveyJson && (
        <SurveyComponent
          surveyJson={surveyJson}
          onComplete={handleComplete}
          onValueChanged={handleDataChange}
          initialData={initialData}
          initialPageNo={savedPageNo}
        />
      )}
    </>
  );
}

export default TAPESurvey;
