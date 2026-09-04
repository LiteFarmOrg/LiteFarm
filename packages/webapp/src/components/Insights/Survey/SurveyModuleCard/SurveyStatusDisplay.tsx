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
import Gauge from './Gauge';
import { getLocalizedDateString } from '../../../../util/moment';
import type { SurveyState } from './index';
import styles from './styles.module.scss';

interface SurveyStatusDisplayProps {
  survey: SurveyState;
}

const STARTED_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

const SurveyStatusDisplay = ({ survey }: SurveyStatusDisplayProps) => {
  const { t } = useTranslation();

  switch (survey.type) {
    case 'not-started':
      return <Gauge />;

    case 'in-progress': {
      const filled = Math.min(Math.max(survey.progress, 0), 100);

      return (
        <div className={styles.progress}>
          <span className={styles.progressLabel}>{t('INSIGHTS.SURVEY.CARD.IN_PROGRESS')}</span>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={filled}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('INSIGHTS.SURVEY.CARD.IN_PROGRESS')}
          >
            <div className={styles.progressFill} style={{ width: `${filled}%` }} />
          </div>
          <span className={styles.progressStarted}>
            {t('INSIGHTS.SURVEY.CARD.STARTED', {
              date: getLocalizedDateString(survey.startedAt, STARTED_DATE_FORMAT),
            })}
          </span>
        </div>
      );
    }

    case 'completed':
      if (survey.score === undefined) {
        return (
          <svg className={styles.check} viewBox="0 0 120 86" aria-hidden="true">
            <circle className={styles.checkCircle} cx="60" cy="40" r="32" />
            <path className={styles.checkMark} d="M51 41L57 47L69 33" />
          </svg>
        );
      }

      return <Gauge score={survey.score} />;
  }
};

export default SurveyStatusDisplay;
