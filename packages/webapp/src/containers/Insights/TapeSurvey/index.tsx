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

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CompleteEvent } from 'survey-core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTapeSurveyPrepopulatedData } from './useTapeSurveyPrepopulatedData';
import { saveSurveyProgress, clearSurvey, tapeSurveySelector } from './tapeSurveySlice';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import {
  usePrefetch,
  useGetTapeSurveyJsonQuery,
  useAddTapeSurveyMutation,
} from '../../../store/api/tapeSurveyApi';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';

interface TAPESurveyProps {
  isCompactSideMenu: boolean;
  surveyVersion: string;
}

function TAPESurvey({ isCompactSideMenu, surveyVersion }: TAPESurveyProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // @ts-expect-error - userFarmSelector is not typed with TypeScript yet
  const { farm_id } = useSelector(userFarmSelector);

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } =
    useTapeSurveyPrepopulatedData();

  const {
    data: surveyJson,
    isLoading: isSurveyJsonLoading,
    isError: isSurveyJsonError,
  } = useGetTapeSurveyJsonQuery(surveyVersion);

  const [addTapeSurvey] = useAddTapeSurveyMutation();
  const prefetchSurveyData = usePrefetch('getTapeSurvey');

  const { surveyDataInProgress, currentPageNo: savedPageNo } = useSelector(tapeSurveySelector);
  const notifications: { message: string }[] = useSelector(snackbarSelector);

  const initialData = { ...prepopulatedData, ...surveyDataInProgress };

  const handleDataChange = useCallback((currentPageNo: number, surveyData: Record<string, any>) => {
    dispatch(saveSurveyProgress({ currentPageNo, surveyData }));
  }, []);

  const handleComplete = useCallback(
    async (surveyData: any, options: CompleteEvent) => {
      try {
        await addTapeSurvey({ survey_response: surveyData, farm_id }).unwrap();
        prefetchSurveyData();
        dispatch(clearSurvey());
        navigate('/insights/tape/results');
      } catch {
        // Display the default "An error occurred and we could not save the results." message.
        // (pass translated string for multiple language support)
        options.showSaveError();
      }
    },
    [addTapeSurvey, dispatch, navigate, t],
  );

  useEffect(() => {
    if (isSurveyJsonError) {
      const activeError = notifications.find(
        ({ message }) => message === t('INSIGHTS.TAPE.LOAD_ERROR'),
      );
      if (!activeError) {
        dispatch(enqueueErrorSnackbar(t('INSIGHTS.TAPE.LOAD_ERROR')));
      }
    }
  }, [isSurveyJsonError]);

  const isLoading = isPrepopulatedDataLoading || isSurveyJsonLoading;

  return (
    <div className={insightStyles.insightContainer}>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <div
        className={clsx(styles.tapeSurveyContainer, isCompactSideMenu && styles.compactSideMenu)}
      >
        {/* wait for prepopulated data to load */}
        {!isLoading && surveyJson && (
          <SurveyComponent
            surveyJson={surveyJson}
            onComplete={handleComplete}
            onValueChanged={handleDataChange}
            initialData={initialData}
            initialPageNo={savedPageNo}
          />
        )}
      </div>
    </div>
  );
}

export default TAPESurvey;
