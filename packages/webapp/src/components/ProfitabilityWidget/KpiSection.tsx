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
import DescriptionList from '../Tile/DescriptionList';
import { DescriptionListTile } from '../Tile/DescriptionList';
import TrendBadge, { TrendBadgeProps } from './TrendBadge';
import styles from './styles.module.scss';

export type KpiTrend = TrendBadgeProps;

export interface KpiSectionProps {
  netProfit: { label: string; value: string; trend?: KpiTrend };
  totalRevenue: { label: string; value: string };
  totalExpenses: { label: string; value: string };
  margin: { label: string; value: string };
  expanded?: boolean;
}

const KpiSection = ({
  netProfit,
  totalRevenue,
  totalExpenses,
  margin,
  expanded = false,
}: KpiSectionProps) => {
  return (
    <div className={styles.kpiSection}>
      <div className={styles.kpiHero}>
        <DescriptionListTile
          label={netProfit.label}
          data={netProfit.value}
          className={styles.kpiHeroTile}
        />
        {netProfit.trend && <TrendBadge {...netProfit.trend} />}
      </div>
      <DescriptionList
        descriptionListTilesProps={[
          {
            label: totalRevenue.label,
            data: totalRevenue.value,
            className: clsx(styles.kpiTile, styles.revenue, expanded && styles.expanded),
          },
          {
            label: totalExpenses.label,
            data: totalExpenses.value,
            className: clsx(styles.kpiTile, styles.expenses, expanded && styles.expanded),
          },
          {
            label: margin.label,
            data: margin.value,
            className: clsx(styles.kpiTile, styles.margin, expanded && styles.expanded),
          },
        ]}
        className={styles.kpiCompactRow}
      />
    </div>
  );
};

export default KpiSection;
