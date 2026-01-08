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

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './styles.module.scss';
import { Main, Semibold } from '../../../components/Typography';
import PageTitle from '../../../components/PageTitle';

const CHART_COLOR = 'rgba(85, 143, 112, 1)'; // --Colors-Secondary-Secondary-green-700
const CHART_FILL_COLOR = 'rgba(85, 143, 112, 0.2)'; // reduced opacity

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface TAPEDimension {
  dimension: string;
  score: number;
  maxScore: number;
}

function TAPEResults() {
  const { t } = useTranslation();
  const location = useLocation<{ surveyData: any }>();
  const surveyData = location.state?.surveyData;

  const tapeData = analyzeTAPEData(surveyData);

  const chartData = {
    labels: tapeData.map((d) => d.dimension),
    datasets: [
      {
        label: 'Your Farm',
        data: tapeData.map((d) => d.score),
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
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.r}/100`,
        },
      },
    },
  };

  return (
    <>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <Semibold className={styles.titleText}>{t('INSIGHTS.TAPE.RESULTS_TITLE')}</Semibold>
      {tapeData && tapeData.length > 0 ? (
        <div className={styles.chartContainer}>
          <Radar data={chartData} options={options} />
        </div>
      ) : (
        <Main className={styles.titleText}>{t('INSIGHTS.TAPE.NO_RESULTS')}</Main>
      )}
    </>
  );
}

const analyzeTAPEData = (data: any): TAPEDimension[] => {
  if (!data) return [];

  // TODO: Replace with actual TAPE scoring logic summed over sections; sections below are accurate. Comments indicate the naming structure in the actual survey data
  return [
    { dimension: 'Diversity', score: 75, maxScore: 100 }, // diversity_1
    { dimension: 'Synergy', score: 82, maxScore: 100 }, // synergy_2
    { dimension: 'Recycling', score: 68, maxScore: 100 }, // recycling_3
    { dimension: 'Efficiency', score: 90, maxScore: 100 }, // efficiency_4
    { dimension: 'Resilience', score: 90, maxScore: 100 }, // resilience_5
    { dimension: 'Culture and food traditions', score: 85, maxScore: 100 }, // culture_6
    { dimension: 'Co-creation and sharing of knowledge', score: 78, maxScore: 100 }, // knowledge_7
    { dimension: 'Human and social values', score: 72, maxScore: 100 }, // human_8
    { dimension: 'Circular economy and solidarity', score: 88, maxScore: 100 }, // circular_9
    { dimension: 'Responsible governance', score: 95, maxScore: 100 }, // governance_10
  ];
};

export default TAPEResults;
