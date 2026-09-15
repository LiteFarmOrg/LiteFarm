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

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';
import { Semibold } from '../../../components/Typography';
import Button from '../../../components/Form/Button';
import SurveyIcon from '../../../assets/images/survey.svg?react';
import GreyHeaderChevron from '../../../assets/images/header-chevron-left.svg?react';
import NewVersionBadge from '../../../components/SimpleBadges/NewVersionBadge';
import TapeRadarChart from './TapeRadarChart';
import { getTAPEDimensionScores } from './caetScores';
import SurveyModuleSection from '../../../components/Insights/Survey/SurveyModuleSection';
import { COMPLETED_DATE_OPTIONS } from '../../../components/Insights/Survey/SurveyModuleCard';
import { useSurveyModules } from './useSurveyModules';
import { surveyDraftSelector } from './surveyDraftSlice';
import { isLocalDraftStale } from './utils';
import { hasNewSurveyVersion } from './surveyConfig';
import { getLocalizedDateString } from '../../../util/moment';
import {
  useGetLatestSurveyResponseQuery,
  useGetSurveyDraftsQuery,
} from '../../../store/api/surveyApi';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';

function TAPEResults({ surveyId = 'tape' }: { surveyId?: string }) {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const {
    data: surveyData,
    error: surveyDataError,
    isSuccess,
  } = useGetLatestSurveyResponseQuery({
    surveyKey: surveyId,
  });
  const { survey_response } = surveyData || {};
  const notifications: { message: string }[] = useSelector(snackbarSelector);

  const localDraft = useSelector(surveyDraftSelector(surveyId));
  const { data: serverDrafts } = useGetSurveyDraftsQuery();
  const serverDraft = serverDrafts?.[surveyId];
  const hasDraftInProgress =
    !!serverDraft?.has_data ||
    (Object.keys(localDraft.surveyData).length > 0 && !isLocalDraftStale(localDraft, serverDraft));

  useEffect(() => {
    if ((isSuccess && !surveyData) || hasDraftInProgress) {
      // No saved survey for this farm (e.g. if they open the results page directly without
      // completing the survey) or a retake is already in progress: send the user to fill it in.
      history.replace(`/insights/survey/${surveyId}`);
    } else if (surveyDataError) {
      const activeError = notifications.find(
        ({ message }) => message === t('INSIGHTS.TAPE.RESULTS_LOAD_ERROR'),
      );
      if (!activeError) {
        dispatch(enqueueErrorSnackbar(t('INSIGHTS.TAPE.RESULTS_LOAD_ERROR')));
      }
    }
  }, [surveyDataError, isSuccess, surveyData, hasDraftInProgress]);

  const caetScores = survey_response ? getTAPEDimensionScores(survey_response) : [];
  const modules = useSurveyModules(surveyId, survey_response);

  // modules.length > 0 means both "retake is available" and "there's a module section to show"
  const hasModules = modules.length > 0;

  const openModule = (moduleSurveyId: string) => history.push(`/insights/survey/${moduleSurveyId}`);

  const hasNewVersion = hasNewSurveyVersion(); // returns false until LF-5473 is implemented
  const completedDate = surveyData
    ? getLocalizedDateString(surveyData.created_at, COMPLETED_DATE_OPTIONS)
    : '';

  return (
    <div className={insightStyles.insightContainer}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.headerTitle}>
            <button className={styles.backButton} onClick={() => history.push('/Insights')}>
              <GreyHeaderChevron />
            </button>
            <span className={styles.title}>{t('INSIGHTS.TAPE.TITLE')}</span>
          </div>
          <div className={styles.completionText}>
            {t('INSIGHTS.SURVEY.CARD.COMPLETED_ON', { date: completedDate })}
          </div>
        </div>
        {hasModules && (
          <div className={styles.headerAction}>
            {hasNewVersion && <NewVersionBadge className={styles.newVersionBadge} />}
            <Button sm color="secondary" onClick={() => openModule(surveyId)}>
              <SurveyIcon />
              <span className={styles.buttonLabel}>
                {hasNewVersion
                  ? t('INSIGHTS.SURVEY.CARD.RETAKE_SURVEY')
                  : t('INSIGHTS.SURVEY.CARD.UPDATE')}
              </span>
            </Button>
          </div>
        )}
      </div>
      <div className={styles.resultsContainer}>
        <div className={styles.sectionContainer}>
          <Semibold className={styles.titleText}>{t('INSIGHTS.TAPE.RESULTS_TITLE')}</Semibold>
          {caetScores.length > 0 && <TapeRadarChart dimensions={caetScores} />}
        </div>
        {hasModules && <SurveyModuleSection modules={modules} onModuleAction={openModule} />}
      </div>
    </div>
  );
}

export default TAPEResults;
