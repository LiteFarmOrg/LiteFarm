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
import * as Sentry from '@sentry/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSurveyPrepopulatedData } from './useSurveyPrepopulatedData';
import { useSurveyTitle } from './useSurveyTitle';
import { saveSurveyProgress, clearSurvey } from './surveyDraftSlice';
import {
  SURVEY_INFO,
  getSurveyCdnPath,
  getSurveyVersion,
  getPostSubmitRoute,
  getSurveyBackUrl,
  getAvailableModuleIds,
  hasNewSurveyVersion,
  getLatestSurveyVersion,
} from './surveyConfig';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import Spinner from '../../../components/Spinner';
import {
  usePrefetch,
  useGetSurveyJsonQuery,
  useGetLatestSurveyResponsesQuery,
  useGetSurveyVersionManifestQuery,
  useAddSurveyResponseMutation,
  SurveyResponseRecord,
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

const getSurveyInitialData = (
  draftSurveyData: Record<string, any> | undefined,
  surveyResponse: SurveyResponseRecord | undefined,
  prepopulatedData: Record<string, any>,
  hasNewVersion: boolean,
): Record<string, any> => {
  if (draftSurveyData) {
    return draftSurveyData;
  }
  if (surveyResponse && !hasNewVersion) {
    return surveyResponse.survey_response;
  }

  return prepopulatedData;
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
  const parentSurveyId = SURVEY_INFO[surveyId]?.parentSurveyId;

  const { data: responses, isLoading: isResponsesLoading } = useGetLatestSurveyResponsesQuery();
  const parentResponse = parentSurveyId ? responses?.[parentSurveyId] : undefined;
  const ownResponse = responses?.[surveyId];

  const isGuardPending = !!parentSurveyId && isResponsesLoading;

  const isUnauthorizedModule =
    !!parentSurveyId &&
    !isResponsesLoading &&
    !getAvailableModuleIds(parentSurveyId, parentResponse?.survey_response).includes(surveyId);

  const isBlockedModule = isGuardPending || isUnauthorizedModule;

  const { data: versionManifest, isLoading: isVersionManifestLoading } =
    useGetSurveyVersionManifestQuery(cdnDirectory ?? '', {
      skip: !cdnDirectory,
    });
  const latestVersion = getLatestSurveyVersion(surveyId, country_code, versionManifest);

  const draftState = useInitialDraft(surveyId);
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
    { skip: !cdnDirectory || !cdnPath || isBlockedModule },
  );

  const { prepopulatedData, isLoading: isPrepopulatedDataLoading } = useSurveyPrepopulatedData(
    surveyId,
    surveyJson,
  );

  const [addSurveyResponse] = useAddSurveyResponseMutation();
  const prefetchLatestResponse = usePrefetch('getLatestSurveyResponse');

  const notifications: { message: string }[] = useSelector(snackbarSelector);

  const surveyVersion = surveyJson ? getSurveyVersion(surveyJson) : undefined;

  const { onCurrentPageChanged, recordLatestDraft, markSurveyCompleted } = useSurveyDraftSync({
    surveyId,
    surveyVersion,
    ...draftState,
  });

  const initialData = getSurveyInitialData(
    hasDraft ? draftState.initialDraft.surveyData : undefined,
    ownResponse,
    prepopulatedData,
    hasNewSurveyVersion(ownResponse?.survey_version, latestVersion),
  );

  const handleDataChange = useCallback(
    (currentPageNo: number, surveyData: Record<string, any>) => {
      dispatch(saveSurveyProgress({ surveyId, currentPageNo, surveyData, surveyVersion }));
      recordLatestDraft(surveyData, currentPageNo);
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
        markSurveyCompleted();
        // Replace instead of push so the submitted survey is not left in the history stack
        history.replace(getPostSubmitRoute(surveyId));
      } catch {
        // Display the default "An error occurred and we could not save the results." message.
        options.showSaveError();
      }
    },
    [
      addSurveyResponse,
      prefetchLatestResponse,
      markSurveyCompleted,
      dispatch,
      history,
      surveyId,
      farm_id,
    ],
  );

  // Redirect to Insights if this survey is unknown or not available to the farm's country
  useEffect(() => {
    if ((!draftState.isDraftLoading && !cdnPath) || isUnauthorizedModule) {
      history.replace('/Insights');
    }
  }, [draftState.isDraftLoading, cdnPath, isUnauthorizedModule, history]);

  useEffect(() => {
    if (isSurveyJsonError) {
      const activeError = notifications.find(
        ({ message }) => message === t('INSIGHTS.TAPE.LOAD_ERROR'),
      );
      if (!activeError) {
        dispatch(enqueueErrorSnackbar(t('INSIGHTS.TAPE.LOAD_ERROR')));
      }
      // Surfaces a missing/unreachable survey file (e.g. an archived version that should exist but
      // doesn't) so it gets noticed operationally, not just silently retried by one farmer.
      Sentry.captureException('Failed to fetch survey JSON', {
        tags: { surveyId },
        extra: { cdnDirectory, version: cdnPath, fallbackVersion: cdnFallbackPath },
      });
    }
  }, [isSurveyJsonError]);

  const isLoading =
    isPrepopulatedDataLoading || isSurveyJsonLoading || isBlockedModule || isVersionManifestLoading;

  return (
    <div className={insightStyles.insightContainer}>
      {!isBlockedModule && <PageTitle title={surveyTitle} backUrl={getSurveyBackUrl(surveyId)} />}
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
