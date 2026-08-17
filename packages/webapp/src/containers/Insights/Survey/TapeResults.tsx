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
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';
import { Semibold } from '../../../components/Typography';
import PageTitle from '../../../components/PageTitle';
import { roundToOne } from '../../../util/rounding';
import { useGetLatestSurveyResponseQuery } from '../../../store/api/surveyApi';
import { enqueueErrorSnackbar, snackbarSelector } from '../../Snackbar/snackbarSlice';

const CHART_COLOR = 'rgba(85, 143, 112, 1)'; // --Colors-Secondary-Secondary-green-700
const CHART_FILL_COLOR = 'rgba(85, 143, 112, 0.2)'; // reduced opacity
const MAX_SCORE = 100;
const RAW_MAX_SCORE = 4;

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface TAPEDimension {
  dimension: string;
  score: number;
  maxScore: number;
}

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

  useEffect(() => {
    if (isSuccess && !surveyData) {
      // No saved survey for this farm: send the user to fill it in (e.g. if they open the results
      // page directly without completing the survey).
      history.replace(`/insights/survey/${surveyId}`);
    } else if (surveyDataError) {
      const activeError = notifications.find(
        ({ message }) => message === t('INSIGHTS.TAPE.RESULTS_LOAD_ERROR'),
      );
      if (!activeError) {
        dispatch(enqueueErrorSnackbar(t('INSIGHTS.TAPE.RESULTS_LOAD_ERROR')));
      }
    }
  }, [surveyDataError, isSuccess, surveyData]);

  const tapeData = survey_response ? getTAPEDimensionScores(survey_response) : [];

  const chartData = {
    labels: tapeData.map((d) => d.dimension),
    datasets: [
      {
        data: tapeData.map((d) => roundToOne(d.score)),
        backgroundColor: CHART_FILL_COLOR,
        borderColor: CHART_COLOR,
        borderWidth: 2,
        pointBackgroundColor: CHART_COLOR,
        pointHoverBorderColor: CHART_COLOR,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: MAX_SCORE,
        ticks: {
          stepSize: 20,
        },
        pointLabels: {
          font: {
            size: 14,
          },
          // Splits labels into a maximum of 2 lines (assumes English labels)
          callback: (label: any) => {
            const words = label.split(' ');
            const splitIndex = words.length === 1 ? 1 : Math.floor(words.length / 2);

            return [words.slice(0, splitIndex).join(' '), words.slice(splitIndex).join(' ')];
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.parsed.r}%`,
        },
      },
    },
  };

  return (
    <div className={insightStyles.insightContainer}>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <div className={styles.resultsContainer}>
        <div className={styles.sectionContainer}>
          <Semibold className={styles.titleText}>{t('INSIGHTS.TAPE.RESULTS_TITLE')}</Semibold>
          <div className={styles.chartContainerWrapper}>
            {tapeData && tapeData.length > 0 && (
              <div className={styles.chartContainer}>
                <Radar data={chartData} options={options} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DIMENSIONS = [
  { dimension: 'Diversity', prefix: 'diversity_1', scoreField: 'div_score' },
  { dimension: 'Synergy', prefix: 'synergy_2', scoreField: 'synergy_score' },
  { dimension: 'Recycling', prefix: 'recycling_3', scoreField: 'recycling_score' },
  { dimension: 'Efficiency', prefix: 'efficiency_4', scoreField: 'efficiency_score' },
  { dimension: 'Resilience', prefix: 'resilience_5', scoreField: 'resilience_score' },
  { dimension: 'Culture and food traditions', prefix: 'culture_6', scoreField: 'cultfood_score' },
  {
    dimension: 'Co-creation and sharing of knowledge',
    prefix: 'knowledge_7',
    scoreField: 'cocrea_score',
  },
  { dimension: 'Human and social values', prefix: 'human_8', scoreField: 'human_score' },
  {
    dimension: 'Circular economy and solidarity',
    prefix: 'circular_9',
    scoreField: 'circular_score',
  },
  { dimension: 'Responsible governance', prefix: 'governance_10', scoreField: 'respgov_score' },
];

const OVERALL_SCORE_FIELD = 'caet_score';

const getTAPEDimensionScores = (data: any): TAPEDimension[] => {
  if (!data) {
    return [];
  }

  return OVERALL_SCORE_FIELD in data ? readTAPEScores(data) : analyzeTAPEData(data);
};

const readTAPEScores = (data: any): TAPEDimension[] =>
  DIMENSIONS.map(({ dimension, scoreField }) => ({
    dimension,
    score: Number(data[scoreField]) || 0,
    maxScore: MAX_SCORE,
  }));

const analyzeTAPEData = (data: any): TAPEDimension[] => {
  return DIMENSIONS.map(({ dimension, prefix }) => {
    const scores = Object.keys(data)
      .filter((key) => key.startsWith(prefix))
      .map((key) => Number(data[key]) || 0);

    if (!scores.length) {
      return { dimension, score: 0, maxScore: MAX_SCORE };
    }

    const averageRawScore = scores.reduce((sum, value) => sum + value, 0) / scores.length;

    return {
      dimension,
      score: (averageRawScore / RAW_MAX_SCORE) * MAX_SCORE,
      maxScore: MAX_SCORE,
    };
  });
};

export default TAPEResults;
