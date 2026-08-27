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
import clsx from 'clsx';
import {
  getSurveyScoreBand,
  SURVEY_SCORE_MAX,
  SURVEY_SCORE_MIN,
  SurveyScoreBand,
} from '../../../util/surveyScoreBand';
import useSurveyScoreBandLabels from '../../../hooks/useSurveyScoreBandLabels';
import styles from './styles.module.scss';

// Semicircular arc from (6,66) to (114,66) with 54px radius
// Matched to 120x66 viewBox set below
const ARC_PATH = 'M6 66A54 54 0 0 1 114 66';
const ARC_PATH_LENGTH = 100;

const BAND_CLASSES: Record<SurveyScoreBand, string> = {
  '1-very-low': styles.band1VeryLow,
  '2-low': styles.band2Low,
  '3-medium': styles.band3Medium,
  '4-high': styles.band4High,
  '5-very-high': styles.band5VeryHigh,
};

export interface GaugeProps {
  score?: number;
}

const Gauge = ({ score }: GaugeProps) => {
  const { t } = useTranslation();
  const bandLabels = useSurveyScoreBandLabels();

  if (score === undefined) {
    return (
      <div className={styles.gauge}>
        <svg className={styles.arc} viewBox="0 0 120 66" aria-hidden="true">
          <path className={styles.track} d={ARC_PATH} />
        </svg>
        <span className={styles.placeholder}>{t('INSIGHTS.SURVEY.NO_SCORE_YET')}</span>
      </div>
    );
  }

  const clampedScore = Math.min(Math.max(score, SURVEY_SCORE_MIN), SURVEY_SCORE_MAX);
  const band = getSurveyScoreBand(clampedScore);

  return (
    <div className={clsx(styles.gauge, BAND_CLASSES[band])}>
      <svg className={styles.arc} viewBox="0 0 120 66" aria-hidden="true">
        <path className={styles.track} d={ARC_PATH} />
        <path
          className={styles.fill}
          d={ARC_PATH}
          pathLength={ARC_PATH_LENGTH}
          strokeDasharray={`${clampedScore} ${ARC_PATH_LENGTH}`}
        />
      </svg>
      <span className={styles.value}>{`${Math.round(clampedScore)}%`}</span>
      <span className={styles.category}>{bandLabels[band]}</span>
    </div>
  );
};

export default Gauge;
