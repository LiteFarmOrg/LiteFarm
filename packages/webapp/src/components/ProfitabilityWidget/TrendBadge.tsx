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
import { TrendDirection } from './constants';
import styles from './styles.module.scss';

export interface TrendBadgeProps {
  percent: number;
  direction: TrendDirection;
  suffixLabel: string;
  tooltip?: string;
}

const directionArrow = (direction: TrendDirection): string => {
  if (direction === 'up') return '↗';
  if (direction === 'down') return '↘';
  return '→';
};

const TrendBadge = ({ percent, direction, suffixLabel, tooltip }: TrendBadgeProps) => (
  <Tooltip title={tooltip ?? ''} placement="top" arrow disableHoverListener={!tooltip}>
    <span className={styles.trendBadge}>
      <span aria-hidden="true">{directionArrow(direction)}</span>
      <span>
        {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
        {percent}%
      </span>
      <span className={styles.trendSuffix}>{suffixLabel}</span>
    </span>
  </Tooltip>
);

export default TrendBadge;
