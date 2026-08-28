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
import type { TFunction } from 'i18next';
import Button, { ButtonProps } from '../Form/Button';
import SurveyIcon from '../../assets/images/survey.svg?react';
import SurveyStatusDisplay from './SurveyStatusDisplay';
import NewVersionBadge from '../SimpleBadges/NewVersionBadge';
import { getLocalizedDateString } from '../../util/moment';
import styles from './styles.module.scss';

export type SurveyState =
  | { type: 'not-started'; estimatedMinutes: number }
  | { type: 'in-progress'; progress: number; startedAt: Date }
  | { type: 'completed'; completedAt: Date; score?: number; hasNewVersion?: boolean };

export interface SurveyModuleCardProps {
  title: string;
  onAction: () => void;
  survey: SurveyState;
}

interface CardActionConfig {
  actionColor: ButtonProps['color'];
  actionLabel: string;
  metaText: string | null;
}

const COMPLETED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const getCardConfig = (survey: SurveyState, t: TFunction): CardActionConfig => {
  switch (survey.type) {
    case 'not-started':
      return {
        actionColor: 'primary',
        actionLabel: t('INSIGHTS.SURVEY.CARD.TAKE_SURVEY'),
        metaText: t('INSIGHTS.SURVEY.CARD.ESTIMATED_MINUTES', { minutes: survey.estimatedMinutes }),
      };

    case 'in-progress':
      return {
        actionColor: 'secondary-2',
        actionLabel: t('INSIGHTS.SURVEY.CARD.RESUME'),
        metaText: null,
      };

    case 'completed': {
      const date = getLocalizedDateString(survey.completedAt, COMPLETED_DATE_OPTIONS);
      return {
        actionColor: 'secondary',
        actionLabel: survey.hasNewVersion
          ? t('INSIGHTS.SURVEY.CARD.RETAKE_SURVEY')
          : t('INSIGHTS.SURVEY.CARD.UPDATE'),
        metaText:
          survey.score === undefined
            ? t('INSIGHTS.SURVEY.CARD.COMPLETED_ON', { date })
            : t('INSIGHTS.SURVEY.CARD.LAST_UPDATED', { date }),
      };
    }
  }
};

const SurveyModuleCard = ({ title, onAction, survey }: SurveyModuleCardProps) => {
  const { t } = useTranslation();
  const { actionColor, actionLabel, metaText } = getCardConfig(survey, t);

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        {survey.type === 'completed' && survey.hasNewVersion && <NewVersionBadge />}
      </div>
      <div className={styles.body}>
        <SurveyStatusDisplay survey={survey} />
      </div>
      <span className={styles.meta}>{metaText}</span>
      <Button sm color={actionColor} className={styles.action} onClick={onAction}>
        <SurveyIcon />
        {actionLabel}
      </Button>
    </div>
  );
};

export default SurveyModuleCard;
