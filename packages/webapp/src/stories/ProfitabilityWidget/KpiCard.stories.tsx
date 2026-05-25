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

import KpiCard from '../../components/ProfitabilityWidget/KpiCard';
import { KpiVariant } from '../../components/ProfitabilityWidget/constants';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/KpiCard',
  component: KpiCard,
  decorators: componentDecorators,
};

export const NetProfitHero = {
  render: () => (
    <KpiCard
      variant={KpiVariant.NET_PROFIT}
      label="Net profit"
      value="$12,450.00"
      size="hero"
      trend={{ percent: 18.5, direction: 'up', suffixLabel: 'vs last year' }}
    />
  ),
};

export const RevenueCompact = {
  render: () => <KpiCard variant={KpiVariant.REVENUE} label="Total revenue" value="$24,800.00" />,
};

export const ExpensesCompact = {
  render: () => <KpiCard variant={KpiVariant.EXPENSES} label="Total expenses" value="$12,350.00" />,
};

export const MarginCompact = {
  render: () => <KpiCard variant={KpiVariant.MARGIN} label="Margin" value="50%" />,
};

export const AllExpanded = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <KpiCard
        variant={KpiVariant.NET_PROFIT}
        label="Net profit"
        value="$12,450.00"
        size="hero"
        expanded
        trend={{ percent: 18.5, direction: 'up', suffixLabel: 'vs last year' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <KpiCard variant={KpiVariant.REVENUE} label="Total revenue" value="$24,800" expanded />
        <KpiCard variant={KpiVariant.EXPENSES} label="Total expenses" value="$12,350" expanded />
        <KpiCard variant={KpiVariant.MARGIN} label="Margin" value="50%" expanded />
      </div>
    </div>
  ),
};
