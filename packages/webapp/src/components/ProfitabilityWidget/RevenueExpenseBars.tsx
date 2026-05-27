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

import { LinearProgress } from '@mui/material';
import styles from './styles.module.scss';

export interface GroupBar {
  id: string;
  label: string;
  total: number;
  percentOfTotal: number;
}

export interface RevenueExpenseBarsProps {
  revenueHeading: string;
  expenseHeading: string;
  revenueGroups: GroupBar[];
  expenseCategories: GroupBar[];
  formatValue: (value: number) => string;
}

interface BarRowProps {
  group: GroupBar;
  fillColor: string;
  trackColor: string;
  formatValue: (value: number) => string;
}

const BarRow = ({ group, fillColor, trackColor, formatValue }: BarRowProps) => (
  <div className={styles.barRow}>
    <div className={styles.barRowHeader}>
      <span>{group.label}</span>
      <span className={styles.barRowValue}>{formatValue(group.total)}</span>
    </div>
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, group.percentOfTotal))}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: trackColor,
        '& .MuiLinearProgress-bar': {
          backgroundColor: fillColor,
        },
      }}
    />
  </div>
);

const RevenueExpenseBars = ({
  revenueHeading,
  expenseHeading,
  revenueGroups,
  expenseCategories,
  formatValue,
}: RevenueExpenseBarsProps) => {
  return (
    <div className={styles.revenueExpenseBars}>
      <div className={styles.barsColumn}>
        <div className={styles.barsColumnHeading}>{revenueHeading}</div>
        {revenueGroups.map((group) => (
          <BarRow
            key={group.id}
            group={group}
            fillColor="#308f85"
            trackColor="#ebf5f4"
            formatValue={formatValue}
          />
        ))}
      </div>
      <div className={styles.barsColumn}>
        <div className={styles.barsColumnHeading}>{expenseHeading}</div>
        {expenseCategories.map((group) => (
          <BarRow
            key={group.id}
            group={group}
            fillColor="#eb6034"
            trackColor="#ffdcd1"
            formatValue={formatValue}
          />
        ))}
      </div>
    </div>
  );
};

export default RevenueExpenseBars;
