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
import { SURVEY_SCORE_BAND_RANGES, SURVEY_SCORE_MIN, SurveyScoreBand } from '../utils';
import useSurveyScoreBandLabels from '../useSurveyScoreBandLabels';
import styles from './styles.module.scss';

const BAND_CLASSES: Record<SurveyScoreBand, string> = {
  '1-very-low': styles.band1VeryLow,
  '2-low': styles.band2Low,
  '3-medium': styles.band3Medium,
  '4-high': styles.band4High,
  '5-very-high': styles.band5VeryHigh,
};

export interface SurveyBandLegendProps {
  className?: string;
}

const SurveyBandLegend = ({ className }: SurveyBandLegendProps) => {
  const { t } = useTranslation();
  const bandLabels = useSurveyScoreBandLabels();

  return (
    <div className={clsx(styles.legend, className)}>
      {SURVEY_SCORE_BAND_RANGES.map(({ band, min, max }) => (
        <div key={band} className={clsx(styles.entry, BAND_CLASSES[band])}>
          <span className={styles.swatch} />
          <div className={styles.labels}>
            <span className={styles.name}>{bandLabels[band]}</span>
            <span className={styles.range}>
              {
                min === SURVEY_SCORE_MIN
                  ? t('INSIGHTS.SURVEY.BAND_RANGE.INCLUSIVE', { min, max }) // 0 - 20%
                  : t('INSIGHTS.SURVEY.BAND_RANGE.GREATER_THAN_MIN', { min, max }) // > 20% - 40%
              }
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurveyBandLegend;
