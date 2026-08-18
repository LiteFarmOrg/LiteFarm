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

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { CompleteEvent } from 'survey-core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSurveyPrepopulatedData } from './useSurveyPrepopulatedData';
import { useSurveyTitle } from './useSurveyTitle';
import { saveSurveyProgress, clearSurvey, surveyDraftSelector } from './surveyDraftSlice';
import { SURVEY_INFO, getCdnFileName, getSurveyVersion, isSurveyDraftStale } from './surveyConfig';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import SurveyComponent from '../../../components/SurveyComponent';
import DraftResetCallout from './DraftResetCallout';
import PageTitle from '../../../components/PageTitle';
import {
  usePrefetch,
  useGetSurveyJsonQuery,
  useAddSurveyResponseMutation,
} from '../../../store/api/surveyApi';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';

interface SurveyProps {
  isCompactSideMenu: boolean;
}

function Survey({ isCompactSideMenu }: SurveyProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { surveyId } = useParams<{ surveyId: string }>();
  const surveyTitle = useSurveyTitle(surveyId);
  // @ts-expect-error - userFarmSelector is not typed with TypeScript yet
  const { farm_id, country_code } = useSelector(userFarmSelector);

  const cdnFileName = getCdnFileName(surveyId, country_code);
  const cdnDirectory = SURVEY_INFO[surveyId]?.cdnDirectory;

  const {
    data: surveyJson,
    isLoading: isSurveyJsonLoading,
    isError: isSurveyJsonError,
  } = useGetSurveyJsonQuery(
    { cdnDirectory: cdnDirectory ?? '', version: cdnFileName ?? '' },
    { skip: !cdnDirectory || !cdnFileName },
  );

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } = useSurveyPrepopulatedData(
    surveyId,
    surveyJson,
  );

  const [addSurveyResponse] = useAddSurveyResponseMutation();
  const prefetchLatestResponse = usePrefetch('getLatestSurveyResponse');

  const {
    surveyData: surveyDataInProgress,
    currentPageNo: savedPageNo,
    surveyVersion: draftDefinitionVersion,
  } = useSelector(surveyDraftSelector(surveyId));
  const notifications: { message: string }[] = useSelector(snackbarSelector);
  const [showDraftResetBanner, setShowDraftResetBanner] = useState(false);

  const surveyVersion = surveyJson ? getSurveyVersion(surveyJson) : undefined;

  const isDraftStale = isSurveyDraftStale({
    surveyJson,
    hasDraftData: Object.keys(surveyDataInProgress).length > 0,
    draftDefinitionVersion,
    surveyVersion,
  });

  const initialData = isDraftStale
    ? prepopulatedData
    : { ...prepopulatedData, ...surveyDataInProgress };
  const initialPageNo = isDraftStale ? 0 : savedPageNo;

  const handleDataChange = useCallback(
    (currentPageNo: number, surveyData: Record<string, any>) => {
      dispatch(saveSurveyProgress({ surveyId, currentPageNo, surveyData, surveyVersion }));
    },
    [surveyId, surveyVersion],
  );

  const handleComplete = useCallback(
    async (surveyData: any, options: CompleteEvent) => {
      try {
        await addSurveyResponse({
          survey_key: surveyId,
          survey_response: surveyData,
          farm_id,
        }).unwrap();
        prefetchLatestResponse({ surveyKey: surveyId });
        dispatch(clearSurvey({ surveyId }));
        // Replace instead of push so the submitted survey is not left in the history stack
        history.replace(`/insights/survey/${surveyId}/results`);
      } catch {
        // Display the default "An error occurred and we could not save the results." message.
        options.showSaveError();
      }
    },
    [addSurveyResponse, prefetchLatestResponse, dispatch, history, surveyId, farm_id],
  );

  const handleCurrentPageChanged = useCallback(() => {
    setShowDraftResetBanner(false);
  }, []);

  useEffect(() => {
    if (isDraftStale) {
      dispatch(clearSurvey({ surveyId }));
      setShowDraftResetBanner(true);
    }
  }, [isDraftStale, surveyId]);

  // Redirect to Insights if this survey is unknown or not available to the farm's country
  useEffect(() => {
    if (!cdnFileName) {
      history.replace('/Insights');
    }
  }, [cdnFileName, history]);

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
      <PageTitle title={surveyTitle} backUrl="/Insights" />
      <div className={clsx(styles.surveyContainer, isCompactSideMenu && styles.compactSideMenu)}>
        {showDraftResetBanner && <DraftResetCallout />}
        {/* wait for prepopulated data and survey JSON to load */}
        {!isLoading && surveyJson && (
          <SurveyComponent
            surveyJson={surveyJson}
            onComplete={handleComplete}
            onValueChanged={handleDataChange}
            onCurrentPageChanged={handleCurrentPageChanged}
            initialData={initialData}
            initialPageNo={initialPageNo}
          />
        )}
      </div>
    </div>
  );
}

export default Survey;
