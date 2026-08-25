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
import {
  saveSurveyProgress,
  setDraftSubmissionId,
  clearSurvey,
  surveyDraftSelector,
} from './surveyDraftSlice';
import { SURVEY_INFO, getSurveyCdnPath, getSurveyVersion } from './surveyConfig';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import SurveyComponent from '../../../components/SurveyComponent';
import PageTitle from '../../../components/PageTitle';
import Spinner from '../../../components/Spinner';
import {
  usePrefetch,
  useGetSurveyJsonQuery,
  useAddSurveyResponseMutation,
  useGetSurveyDraftQuery,
  useUpsertSurveyDraftMutation,
} from '../../../store/api/surveyApi';
import { isFetchBaseQueryError } from '../../../store/api/typeGuards';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';

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

  const {
    surveyData: surveyDataInProgress,
    currentPageNo: savedPageNo,
    surveyVersion: draftSurveyVersion,
    submissionId,
  } = useSelector(surveyDraftSelector(surveyId, surveyStep));

  const hasDraft = Object.keys(surveyDataInProgress).length > 0;

  const { version: cdnPath, fallbackVersion: cdnFallbackPath } =
    getSurveyCdnPath(
      surveyId,
      country_code,
      getLanguageFromLocalStorage() || 'en',
      draftSurveyVersion,
      hasDraft,
    ) || {};

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

  const { data: serverDraft, isLoading: isServerDraftLoading } = useGetSurveyDraftQuery(
    { surveyKey: surveyId, surveyStep },
    { skip: !surveyId },
  );
  const [upsertSurveyDraft] = useUpsertSurveyDraftMutation();

  const notifications: { message: string }[] = useSelector(snackbarSelector);

  const surveyVersion = surveyJson ? getSurveyVersion(surveyJson) : undefined;

  // Upserts the draft to the server, then syncs the returned submission_id into Redux.
  const persistDraft = useCallback(
    async (payload: { survey_data: Record<string, any>; current_page_no?: number }) => {
      if (!surveyVersion) {
        return;
      }
      try {
        const created = await upsertSurveyDraft({
          surveyKey: surveyId,
          surveyStep,
          survey_version: surveyVersion,
          ...payload,
        }).unwrap();
        dispatch(
          setDraftSubmissionId({ surveyId, surveyStep, submissionId: created.submission_id }),
        );
      } catch (error) {
        if (isFetchBaseQueryError(error) && error.status === 409) {
          // TODO: Handle 409 (survey already completed)
          return;
        }
        // Best effort — a later save trigger will retry.
      }
    },
    [surveyId, surveyStep, surveyVersion, dispatch, upsertSurveyDraft],
  );

  const initialData = { ...prepopulatedData, ...surveyDataInProgress };

  const handleDataChange = useCallback(
    (currentPageNo: number, surveyData: Record<string, any>) => {
      dispatch(
        saveSurveyProgress({ surveyId, currentPageNo, surveyData, surveyVersion, surveyStep }),
      );
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

  // Ensure a submission_id exists on mount — adopted from the server draft, or created fresh —
  // so a stale write can later be recognized as already completed. Only adopt the server draft's
  // content when there's no local draft yet; otherwise defer reconciliation.
  useEffect(() => {
    if (!surveyVersion || isServerDraftLoading || submissionId) {
      return;
    }
    if (serverDraft) {
      dispatch(
        setDraftSubmissionId({ surveyId, surveyStep, submissionId: serverDraft.submission_id }),
      );

      if (!hasDraft) {
        dispatch(
          saveSurveyProgress({
            surveyId,
            currentPageNo: serverDraft.current_page_no,
            surveyData: serverDraft.survey_data,
            surveyVersion: serverDraft.survey_version,
            surveyStep,
          }),
        );
      }
      return;
    }
    persistDraft({ survey_data: {} });
  }, [
    surveyVersion,
    isServerDraftLoading,
    serverDraft,
    submissionId,
    hasDraft,
    surveyId,
    surveyStep,
    dispatch,
    persistDraft,
  ]);

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
            initialPageNo={savedPageNo}
          />
        )}
      </div>
    </div>
  );
}

export default Survey;
