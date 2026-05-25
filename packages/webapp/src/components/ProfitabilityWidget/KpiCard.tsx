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

import clsx from 'clsx';
import { Tooltip } from '@mui/material';
import { KpiVariant, TrendDirection } from './constants';
import styles from './styles.module.scss';

export interface KpiTrend {
  percent: number;
  direction: TrendDirection;
  suffixLabel: string;
  tooltip?: string;
}

export interface KpiCardProps {
  variant: KpiVariant;
  label: string;
  value: string;
  trend?: KpiTrend;
  size?: 'hero' | 'compact';
  expanded?: boolean;
}

const VARIANT_CLASS: Record<KpiVariant, string> = {
  [KpiVariant.NET_PROFIT]: styles.netProfit,
  [KpiVariant.REVENUE]: styles.revenue,
  [KpiVariant.EXPENSES]: styles.expenses,
  [KpiVariant.MARGIN]: styles.margin,
};

const directionArrow = (direction: TrendDirection): string => {
  if (direction === 'up') return '↗';
  if (direction === 'down') return '↘';
  return '→';
};

const KpiCard = ({
  variant,
  label,
  value,
  trend,
  size = 'compact',
  expanded = false,
}: KpiCardProps) => {
  return (
    <div
      className={clsx(
        styles.kpiCard,
        VARIANT_CLASS[variant],
        size === 'hero' && styles.hero,
        expanded && styles.expanded,
      )}
    >
      <div className={styles.kpiBody}>
        <span className={styles.kpiLabel}>{label}</span>
        <span className={styles.kpiValue}>{value}</span>
      </div>
      {size === 'hero' && trend && (
        <Tooltip
          title={trend.tooltip ?? ''}
          placement="top"
          arrow
          disableHoverListener={!trend.tooltip}
        >
          <span className={styles.kpiTrend}>
            <span aria-hidden="true">{directionArrow(trend.direction)}</span>
            <span>
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {trend.percent}%
            </span>
            <span className={styles.suffix}>{trend.suffixLabel}</span>
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default KpiCard;
