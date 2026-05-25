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

import KpiCard, { KpiTrend } from './KpiCard';
import { KpiVariant } from './constants';
import styles from './styles.module.scss';

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
      <KpiCard
        variant={KpiVariant.NET_PROFIT}
        label={netProfit.label}
        value={netProfit.value}
        trend={netProfit.trend}
        size="hero"
        expanded={expanded}
      />
      <div className={styles.kpiCompactRow}>
        <KpiCard
          variant={KpiVariant.REVENUE}
          label={totalRevenue.label}
          value={totalRevenue.value}
          expanded={expanded}
        />
        <KpiCard
          variant={KpiVariant.EXPENSES}
          label={totalExpenses.label}
          value={totalExpenses.value}
          expanded={expanded}
        />
        <KpiCard
          variant={KpiVariant.MARGIN}
          label={margin.label}
          value={margin.value}
          expanded={expanded}
        />
      </div>
    </div>
  );
};

export default KpiSection;
