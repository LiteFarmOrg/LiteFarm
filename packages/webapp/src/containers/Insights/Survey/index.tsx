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
import { useHistory, useParams } from 'react-router-dom';
import { CompleteEvent } from 'survey-core';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSurveyPrepopulatedData } from './useSurveyPrepopulatedData';
import { useSurveyTitle } from './useSurveyTitle';
import { saveSurveyProgress, clearSurvey } from './surveyDraftSlice';
import { SURVEY_INFO, getSurveyCdnPath, getSurveyVersion } from './surveyConfig';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import Spinner from '../../../components/Spinner';
import {
  usePrefetch,
  useGetSurveyJsonQuery,
  useAddSurveyResponseMutation,
} from '../../../store/api/surveyApi';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';
import useSurveyDraftSync from './useSurveyDraftSync';
import useInitialDraft from './useInitialDraft';

interface SurveyProps {
  isCompactSideMenu: boolean;
}

// TODO: LF-5127 Implement properly
const getSurveyStep = (surveyId: string) => {
  if (surveyId === 'cathi_gao') {
    return '';
  }
  return 'STEP1';
};

function Survey({ isCompactSideMenu }: SurveyProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { surveyId } = useParams<{ surveyId: string }>();
  const surveyTitle = useSurveyTitle(surveyId);
  // @ts-expect-error - userFarmSelector is not typed with TypeScript yet
  const { farm_id, country_code } = useSelector(userFarmSelector);

  const cdnDirectory = SURVEY_INFO[surveyId]?.cdnDirectory;
  const surveyStep = getSurveyStep(surveyId);

  const draftState = useInitialDraft(surveyId, surveyStep);
  const hasDraft = Object.keys(draftState.initialDraft.surveyData || {}).length > 0;

  const { version: cdnPath, fallbackVersion: cdnFallbackPath } =
    (!draftState.isDraftLoading &&
      getSurveyCdnPath(
        surveyId,
        country_code,
        getLanguageFromLocalStorage() || 'en',
        draftState.initialDraft.surveyVersion,
        hasDraft,
      )) ||
    {};

  const {
    data: surveyJson,
    isLoading: isSurveyJsonLoading,
    isError: isSurveyJsonError,
  } = useGetSurveyJsonQuery(
    {
      cdnDirectory: cdnDirectory ?? '',
      version: cdnPath ?? '',
      fallbackVersion: cdnFallbackPath,
    },
    { skip: !cdnDirectory || !cdnPath },
  );

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } = useSurveyPrepopulatedData(
    surveyId,
    surveyJson,
  );

  const [addSurveyResponse] = useAddSurveyResponseMutation();
  const prefetchLatestResponse = usePrefetch('getLatestSurveyResponse');

  const notifications: { message: string }[] = useSelector(snackbarSelector);

  const surveyVersion = surveyJson ? getSurveyVersion(surveyJson) : undefined;

  const { onCurrentPageChanged, recordLatestDraft } = useSurveyDraftSync({
    surveyId,
    surveyVersion,
    surveyStep,
    ...draftState,
  });

  const initialData = {
    ...prepopulatedData,
    ...(!draftState.isDraftLoading ? draftState.initialDraft.surveyData : {}),
  };

  const handleDataChange = useCallback(
    (currentPageNo: number, surveyData: Record<string, any>) => {
      dispatch(
        saveSurveyProgress({ surveyId, currentPageNo, surveyData, surveyVersion, surveyStep }),
      );
      recordLatestDraft(surveyData, currentPageNo);
    },
    [surveyId, surveyVersion, surveyStep],
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
        dispatch(clearSurvey({ surveyId, surveyStep }));
        // Replace instead of push so the submitted survey is not left in the history stack
        history.replace(`/insights/survey/${surveyId}/results`);
      } catch {
        // Display the default "An error occurred and we could not save the results." message.
        options.showSaveError();
      }
    },
    [addSurveyResponse, prefetchLatestResponse, dispatch, history, surveyId, farm_id],
  );

  // Redirect to Insights if this survey is unknown or not available to the farm's country
  useEffect(() => {
    if (!cdnPath) {
      history.replace('/Insights');
    }
  }, [cdnPath, history]);

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
        {/* wait for prepopulated data and survey JSON to load */}
        {isLoading && (
          <div className={styles.spinner}>
            <Spinner />
          </div>
        )}
        {!isLoading && surveyJson && (
          <SurveyComponent
            surveyJson={surveyJson}
            onComplete={handleComplete}
            onValueChanged={handleDataChange}
            initialData={initialData}
            initialPageNo={!draftState.isDraftLoading ? draftState.initialDraft.currentPageNo : 0}
            onCurrentPageChanged={onCurrentPageChanged}
          />
        )}
      </div>
    </div>
  );
}

export default Survey;
