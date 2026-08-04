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
import { LinearProgress } from '@mui/material';
import styles from './styles.module.scss';

export interface GroupBar {
  id: string;
  label: string;
  labelKey: string | null;
  total: number;
  percentOfTotal: number;
}

export interface RevenueExpenseBarsProps {
  revenueGroups: GroupBar[];
  expenseCategories: GroupBar[];
  formatValue: (value: number) => string;
}

interface BarRowProps {
  label: string;
  total: number;
  percentOfTotal: number;
  variant: 'revenue' | 'expense';
  formatValue: (value: number) => string;
}

const BarRow = ({ label, total, percentOfTotal, variant, formatValue }: BarRowProps) => (
  <div className={styles.barRow}>
    <div className={styles.barRowHeader}>
      <span className={styles.barRowLabel}>{label}</span>
      <span className={styles.barRowValue}>{formatValue(total)}</span>
    </div>
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, percentOfTotal))}
      classes={{ root: clsx(styles.barProgress, styles[variant]), bar: styles.barFill }}
    />
  </div>
);

const RevenueExpenseBars = ({
  revenueGroups,
  expenseCategories,
  formatValue,
}: RevenueExpenseBarsProps) => {
  const { t } = useTranslation('profitability');
  const resolveLabel = (group: GroupBar): string =>
    group.labelKey ? t(group.labelKey) : group.label;

  return (
    <div className={styles.revenueExpenseBars}>
      <div className={styles.barsColumn}>
        <div className={styles.barsColumnHeading}>{t('TOP_REVENUE_CATEGORIES')}</div>
        {revenueGroups.map((group) => (
          <BarRow
            key={group.id}
            label={resolveLabel(group)}
            total={group.total}
            percentOfTotal={group.percentOfTotal}
            variant="revenue"
            formatValue={formatValue}
          />
        ))}
      </div>
      <div className={styles.barsColumn}>
        <div className={styles.barsColumnHeading}>{t('TOP_EXPENSE_CATEGORIES')}</div>
        {expenseCategories.map((group) => (
          <BarRow
            key={group.id}
            label={resolveLabel(group)}
            total={group.total}
            percentOfTotal={group.percentOfTotal}
            variant="expense"
            formatValue={formatValue}
          />
        ))}
      </div>
    </div>
  );
};

export default RevenueExpenseBars;
