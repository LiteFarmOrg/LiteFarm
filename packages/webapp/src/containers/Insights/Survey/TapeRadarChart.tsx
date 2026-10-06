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

import { useTranslation } from 'react-i18next';
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
import { roundToOne } from '../../../util/rounding';
import { MAX_SCORE, TAPEDimension, TAPEDimensionId } from './caetScores';

const CHART_COLOR = 'rgba(85, 143, 112, 1)'; // --Colors-Secondary-Secondary-green-700
const CHART_FILL_COLOR = 'rgba(85, 143, 112, 0.2)'; // reduced opacity

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const CHART_OPTIONS = {
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
        // Splits labels into a maximum of 2 lines at a word boundary
        callback: (label: string) => {
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
        label: (context: { label: string; parsed: { r: number } }) =>
          ` ${context.label}: ${context.parsed.r}%`,
      },
    },
  },
};

interface TapeRadarChartProps {
  dimensions: Pick<TAPEDimension, 'dimension' | 'score'>[];
}

const TapeRadarChart = ({ dimensions }: TapeRadarChartProps) => {
  const { t } = useTranslation();

  const dimensionLabels: Record<TAPEDimensionId, string> = {
    diversity: t('INSIGHTS.TAPE.DIMENSIONS.DIVERSITY'),
    synergy: t('INSIGHTS.TAPE.DIMENSIONS.SYNERGY'),
    recycling: t('INSIGHTS.TAPE.DIMENSIONS.RECYCLING'),
    efficiency: t('INSIGHTS.TAPE.DIMENSIONS.EFFICIENCY'),
    resilience: t('INSIGHTS.TAPE.DIMENSIONS.RESILIENCE'),
    cultureAndFood: t('INSIGHTS.TAPE.DIMENSIONS.CULTURE_AND_FOOD'),
    cocreationAndKnowledge: t('INSIGHTS.TAPE.DIMENSIONS.COCREATION_AND_KNOWLEDGE'),
    humanAndSocial: t('INSIGHTS.TAPE.DIMENSIONS.HUMAN_AND_SOCIAL'),
    circularEconomy: t('INSIGHTS.TAPE.DIMENSIONS.CIRCULAR_ECONOMY'),
    responsibleGovernance: t('INSIGHTS.TAPE.DIMENSIONS.RESPONSIBLE_GOVERNANCE'),
  };

  const chartData = {
    labels: dimensions.map((d) => dimensionLabels[d.dimension]),
    datasets: [
      {
        data: dimensions.map((d) => roundToOne(d.score)),
        backgroundColor: CHART_FILL_COLOR,
        borderColor: CHART_COLOR,
        borderWidth: 2,
        pointBackgroundColor: CHART_COLOR,
        pointHoverBorderColor: CHART_COLOR,
      },
    ],
  };

  return (
    <div className={styles.chartContainerWrapper}>
      <div className={styles.chartContainer}>
        <Radar data={chartData} options={CHART_OPTIONS} />
      </div>
    </div>
  );
};

export default TapeRadarChart;
