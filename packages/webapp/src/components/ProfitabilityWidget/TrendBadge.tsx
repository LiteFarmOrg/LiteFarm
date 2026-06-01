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

import { Tooltip } from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TrendDirection } from './constants';
import styles from './styles.module.scss';

export interface TrendData {
  percent: number;
  direction: TrendDirection;
}

// Either a real year-over-year trend, or the placeholder shown when no
// meaningful trend can be computed — the previous year had no comparable
// transactions, or the change was so large it was suppressed upstream by
// calcYoYTrend. Both reduce to "not enough comparable prior-year data".
export type TrendBadgeProps = TrendData | { variant: 'insufficientData' };

const directionArrow = (direction: TrendDirection): string => {
  if (direction === 'up') return '↗';
  if (direction === 'down') return '↘';
  return '→';
};

const TrendBadge = (props: TrendBadgeProps) => {
  const { t } = useTranslation('profitability');

  if ('variant' in props) {
    return (
      <Tooltip title={t('KPI.NO_TREND_TOOLTIP')} placement="top" arrow>
        <span className={clsx(styles.trendBadge, styles.placeholder)}>
          <span>-%</span>
          <span aria-hidden="true">→</span>
          <span className={styles.trendSuffix}>{t('KPI.YOY_TREND')}</span>
        </span>
      </Tooltip>
    );
  }

  const { percent, direction } = props;

  return (
    <Tooltip title={t('KPI.YOY_TOOLTIP')} placement="top" arrow>
      <span className={styles.trendBadge}>
        <span aria-hidden="true">{directionArrow(direction)}</span>
        <span>
          {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
          {percent}%
        </span>
        <span className={styles.trendSuffix}>{t('KPI.YOY_TREND')}</span>
      </span>
    </Tooltip>
  );
};

export default TrendBadge;
