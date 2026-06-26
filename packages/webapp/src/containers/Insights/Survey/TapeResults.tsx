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

  const tapeData = survey_response ? analyzeTAPEData(survey_response) : [];

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

const DIMENSION_MAPPING = {
  Diversity: 'diversity_1',
  Synergy: 'synergy_2',
  Recycling: 'recycling_3',
  Efficiency: 'efficiency_4',
  Resilience: 'resilience_5',
  'Culture and food traditions': 'culture_6',
  'Co-creation and sharing of knowledge': 'knowledge_7',
  'Human and social values': 'human_8',
  'Circular economy and solidarity': 'circular_9',
  'Responsible governance': 'governance_10',
};

const analyzeTAPEData = (data: any): TAPEDimension[] => {
  if (!data) return [];

  return Object.entries(DIMENSION_MAPPING).map(([dimension, prefix]) => {
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
