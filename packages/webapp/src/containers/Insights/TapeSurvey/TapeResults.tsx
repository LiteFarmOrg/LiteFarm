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

import { useSelector, useDispatch } from 'react-redux';
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
import { tapeSurveySelector, reopenSurvey } from './tapeSurveySlice';
import styles from './styles.module.scss';
import { Semibold } from '../../../components/Typography';
import PageTitle from '../../../components/PageTitle';
import TapeQuestions from './tapeQuestions.json';
import { roundToOne } from '../../../util/rounding';
import Button from '../../../components/Form/Button';
import { ReactComponent as EditIcon } from '../../../assets/images/edit.svg';

const CHART_COLOR = 'rgba(85, 143, 112, 1)'; // --Colors-Secondary-Secondary-green-700
const CHART_FILL_COLOR = 'rgba(85, 143, 112, 0.2)'; // reduced opacity
const MAX_SCORE = 100;

const getChartTitleFromSurveyTitle = (surveyTitle: unknown) => {
  if (!surveyTitle || typeof surveyTitle !== 'string') return '';

  // Remove the section number from the title
  const titleWithoutSectionNumber = surveyTitle.split(/\s+/).slice(1).join(' ');

  if (titleWithoutSectionNumber === '') return '';

  return (
    titleWithoutSectionNumber.charAt(0).toUpperCase() +
    titleWithoutSectionNumber.slice(1).toLowerCase()
  );
};

const getAnswerKeys = (element: any): string[] => {
  if (Array.isArray(element.elements)) {
    return element.elements.flatMap(getAnswerKeys);
  }
  return element.name ? [element.name] : [];
};

const CHOSEN_SECTION_NAMES = [
  'diversity',
  'synergy',
  'recycling',
  'efficiency',
  'resilience',
  'culture_and_food',
  'cocreation_and_knowledge',
  'human_and_social',
  'responsible_governance',
];

const CHART_SECTION_DATA = TapeQuestions.pages.reduce<ChartSection[]>((acc, cv) => {
  if (CHOSEN_SECTION_NAMES.includes(cv.name)) {
    acc.push({
      dimension: getChartTitleFromSurveyTitle(cv.title),
      answerKeys: getAnswerKeys(cv),
      maxScore: MAX_SCORE,
    });
    return acc;
  }
  return acc;
}, []);

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface TAPEDimension {
  dimension: string;
  score: number;
  maxScore: number;
}

function TAPEResults() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const { surveyData } = useSelector(tapeSurveySelector);

  const tapeData = analyzeTAPEData(surveyData);

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

  const returnToSurvey = () => {
    dispatch(reopenSurvey());
    history.push('/insights/tape');
  };

  return (
    <>
      <PageTitle title={t('INSIGHTS.TAPE.TITLE')} backUrl="/Insights" />
      <div className={styles.buttonContainer}>
        <Button sm color="secondary-2" onClick={returnToSurvey}>
          {t('INSIGHTS.TAPE.UPDATE_ANSWERS')}
          <EditIcon className={styles.editIcon} />
        </Button>
      </div>
      <Semibold className={styles.titleText}>{t('INSIGHTS.TAPE.RESULTS_TITLE')}</Semibold>
      {tapeData && tapeData.length > 0 && (
        <div className={styles.chartContainer}>
          <Radar data={chartData} options={options} />
        </div>
      )}
    </>
  );
}
interface ChartSection {
  dimension: string;
  answerKeys: string[];
  maxScore: number;
}

const analyzeTAPEData = (data: any): TAPEDimension[] => {
  if (!data) return [];

  return CHART_SECTION_DATA.map(({ dimension, answerKeys, maxScore }) => {
    return {
      dimension,
      score:
        25 *
        (answerKeys.reduce<number>((acc, cv) => {
          return data[cv] ? acc + Number(data[cv]) : acc;
        }, 0) /
          answerKeys.length), // simple average
      maxScore,
    };
  });
};

export default TAPEResults;
