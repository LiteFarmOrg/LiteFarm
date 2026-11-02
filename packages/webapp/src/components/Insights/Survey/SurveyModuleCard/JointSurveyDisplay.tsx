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

import { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Gauge from './Gauge';
import { CompletedCheck } from './SurveyStatusDisplay';
import ExternalLinkIcon from '../../../../assets/images/icon_external_link.svg?react';
import { DATA_DASHBOARD_TAPE_URL, type SurveyHalfResult } from '../utils';
import styles from './styles.module.scss';

interface JointSurveyDisplayProps {
  halves: SurveyHalfResult[];
}

const DashboardLink = ({ children }: { children?: ReactNode }) => (
  <a
    className={styles.dashboardLink}
    href={DATA_DASHBOARD_TAPE_URL}
    target="_blank"
    rel="noreferrer"
  >
    {children}
    <ExternalLinkIcon className={styles.dashboardLinkIcon} />
  </a>
);

const HalfResult = ({ half }: { half: SurveyHalfResult }) => {
  const { t } = useTranslation();

  switch (half.status) {
    case 'not-applicable':
      return (
        <div className={styles.notApplicable}>
          <span className={styles.notApplicableLabel}>
            {t('INSIGHTS.SURVEY.CARD.HALF.NOT_APPLICABLE')}
          </span>
          {half.hasNoWomen && (
            <span className={styles.notApplicableReason}>
              {t('INSIGHTS.SURVEY.CARD.HALF.NO_WOMEN')}
            </span>
          )}
        </div>
      );

    case 'scored':
      return <Gauge score={half.score} />;

    case 'completed':
      return (
        <>
          <CompletedCheck />
          {half.display === 'dashboard-link' && (
            <p className={styles.dashboardText}>
              <Trans
                i18nKey="INSIGHTS.SURVEY.CARD.HALF.DASHBOARD_LINK"
                components={{ a: <DashboardLink /> }}
              />
            </p>
          )}
        </>
      );
  }
};

const JointSurveyDisplay = ({ halves }: JointSurveyDisplayProps) => {
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    land_tenure: t('INSIGHTS.SURVEY.CARD.HALF.LAND_TENURE'),
    aweai: t('INSIGHTS.SURVEY.CARD.HALF.AWEAI'),
    biodiversity: t('INSIGHTS.SURVEY.CARD.HALF.BIODIVERSITY'),
    productivity: t('INSIGHTS.SURVEY.CARD.HALF.PRODUCTIVITY'),
  };

  return (
    <div className={styles.halves}>
      {halves.map((half) => (
        <div key={half.id} className={styles.half}>
          <span className={styles.halfLabel}>{labels[half.id]}</span>
          <div className={styles.halfBody}>
            <HalfResult half={half} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default JointSurveyDisplay;
