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
import { RiskLevel } from '../../utils';
import useRiskLevelLabels from '../../useRiskLevelLabels';
import styles from './styles.module.scss';

const RISK_LEVEL_DISPLAY: Record<RiskLevel, { fill: number; className: string }> = {
  'Very Low Risk': { fill: 0, className: styles.veryLowRisk },
  'Low Risk': { fill: 25, className: styles.lowRisk },
  'Moderate Risk': { fill: 50, className: styles.moderateRisk },
  'High Risk': { fill: 75, className: styles.highRisk },
  'Very High Risk': { fill: 100, className: styles.veryHighRisk },
};

export interface RiskBarProps {
  riskLevel?: RiskLevel;
}

const RiskBar = ({ riskLevel }: RiskBarProps) => {
  const { t } = useTranslation();
  const riskLabels = useRiskLevelLabels();

  if (!riskLevel) {
    return (
      <div className={styles.riskBar}>
        <div className={styles.track} aria-hidden="true" />
        <span className={styles.placeholder}>{t('INSIGHTS.SURVEY.NO_SCORE_YET')}</span>
      </div>
    );
  }

  const { fill, className } = RISK_LEVEL_DISPLAY[riskLevel];
  const label = riskLabels[riskLevel];

  return (
    <div className={clsx(styles.riskBar, className)}>
      <span className={styles.label}>{label}</span>
      <div
        className={styles.track}
        role="meter"
        aria-valuenow={fill}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={styles.fill} style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
};

export default RiskBar;
