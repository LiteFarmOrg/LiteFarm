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
import {
  saveSurveyProgress,
  completeSurvey,
  clearSurvey,
  tapeSurveySelector,
} from './tapeSurveySlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import { userFarmSelector } from '../../userFarmSlice';
import {
  useGetTapeSurveyJsonQuery,
  useSubmitTapeSurveyMutation,
} from '../../../store/api/tapeSurveyApi';
import { getSurveyVersion } from './getSurveyVersion';
import { enqueueErrorSnackbar } from '../../Snackbar/snackbarSlice';

function TAPESurvey() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } =
    useTapeSurveyPrepopulatedData();

  // @ts-expect-error -- userFarmSelector issue
  const { country_code } = useSelector(userFarmSelector);
  const versionKey = getSurveyVersion(country_code);

  const {
    data: surveyJson,
    isLoading: isSurveyJsonLoading,
    isError: isSurveyJsonError,
  } = useGetTapeSurveyJsonQuery(versionKey);

  const [submitTapeSurvey] = useSubmitTapeSurveyMutation();

  const { surveyData: savedData, currentPageNo: savedPageNo } = useSelector(tapeSurveySelector);

  const initialData = { ...prepopulatedData, ...savedData };

  const handleDataChange = useCallback((currentPageNo: number, surveyData: Record<string, any>) => {
    dispatch(saveSurveyProgress({ currentPageNo, surveyData }));
  }, []);

  const handleComplete = useCallback(
    async (currentPageNo: number, surveyData: any) => {
      // Persist completion state immediately so TapeResults has data during the transition.
      dispatch(completeSurvey({ currentPageNo, surveyData }));
      try {
        await submitTapeSurvey({ survey_data: surveyData }).unwrap();
        // TODO: Once TapeResults reads from RTK Query cache instead of Redux, remove this
        // clearSurvey call (or move it to after TapeResults has rendered from the cache).
        dispatch(clearSurvey());
        history.push('/insights/tape/results');
      } catch {
        // Submission failed; data stays in Redux so the user can retry.
        dispatch(enqueueErrorSnackbar(t('INSIGHTS.TAPE.SUBMIT_ERROR')));
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
