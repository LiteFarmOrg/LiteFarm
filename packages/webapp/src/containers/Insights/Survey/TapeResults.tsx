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
import PageTitle from '../../../components/PageTitle';
import Button from '../../../components/Form/Button';
import SurveyIcon from '../../../assets/images/survey.svg?react';
import TapeRadarChart from './TapeRadarChart';
import { getTAPEDimensionScores } from './caetScores';
import SurveyModuleSection from '../../../components/Insights/Survey/SurveyModuleSection';
import { useSurveyModules } from './useSurveyModules';
import { surveyDraftSelector } from './surveyDraftSlice';
import { isLocalDraftStale } from './utils';
import { hasNewSurveyVersion } from './surveyConfig';
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

  const openModule = (moduleSurveyId: string) => history.push(`/insights/survey/${moduleSurveyId}`);

  return (
    <div className={insightStyles.insightContainer}>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <div className={styles.resultsContainer}>
        <div className={styles.sectionContainer}>
          <Semibold className={styles.titleText}>{t('INSIGHTS.TAPE.RESULTS_TITLE')}</Semibold>
          {/* TODO: LF-5491 Implement properly */}
          <Button sm color="secondary" onClick={() => openModule(surveyId)}>
            <SurveyIcon />
            {hasNewSurveyVersion() // returns false until LF-5473 is implemented
              ? t('INSIGHTS.SURVEY.CARD.RETAKE_SURVEY')
              : t('INSIGHTS.SURVEY.CARD.UPDATE')}
          </Button>
          {caetScores.length > 0 && <TapeRadarChart dimensions={caetScores} />}
        </div>
        {modules.length > 0 && (
          <SurveyModuleSection modules={modules} onModuleAction={openModule} />
        )}
      </div>
    </div>
  );
}

export default TAPEResults;
