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
import { useTranslation } from 'react-i18next';
import DescriptionList from '../Tile/DescriptionList';
import { DescriptionListTile } from '../Tile/DescriptionList';
import TrendBadge, { TrendBadgeProps } from './TrendBadge';
import styles from './styles.module.scss';

export type KpiTrend = TrendBadgeProps;

export interface KpiSectionProps {
  netProfit: { value: string; trend?: KpiTrend };
  totalRevenue: string;
  totalExpenses: string;
  margin: string;
  expanded?: boolean;
}

const KpiSection = ({
  netProfit,
  totalRevenue,
  totalExpenses,
  margin,
  expanded = false,
}: KpiSectionProps) => {
  const { t } = useTranslation('profitability');

  return (
    <div className={styles.kpiSection}>
      <div className={styles.kpiHero}>
        <DescriptionListTile
          label={t('KPI.NET_PROFIT')}
          data={netProfit.value}
          className={styles.kpiHeroTile}
        />
        {netProfit.trend ? (
          <TrendBadge {...netProfit.trend} />
        ) : (
          <span className={styles.skeletonKpiTrend}>
            <span>-%</span>
            <span aria-hidden="true">&rarr;</span>
            <span className={styles.skeletonKpiTrendSuffix}>y/y</span>
          </span>
        )}
      </div>
      <DescriptionList
        descriptionListTilesProps={[
          {
            label: t('KPI.TOTAL_REVENUE'),
            data: totalRevenue,
            className: clsx(styles.kpiTile, styles.revenue, expanded && styles.expanded),
          },
          {
            label: t('KPI.TOTAL_EXPENSES'),
            data: totalExpenses,
            className: clsx(styles.kpiTile, styles.expenses, expanded && styles.expanded),
          },
          {
            label: t('KPI.MARGIN'),
            data: margin,
            className: clsx(styles.kpiTile, styles.margin, expanded && styles.expanded),
          },
        ]}
        className={styles.kpiCompactRow}
      />
    </div>
  );
};

export default KpiSection;
