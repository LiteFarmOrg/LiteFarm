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

import KpiSection from '../../components/ProfitabilityWidget/KpiSection';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/KpiSection',
  component: KpiSection,
  decorators: componentDecorators,
};

const kpiProps = {
  netProfit: {
    value: '$12,450.00',
    trend: { percent: 18.5, direction: 'up' as const },
  },
  totalRevenue: '$24,800',
  totalExpenses: '$12,350',
  margin: '50%',
};

export const Default = {
  render: () => (
    <div>
      <KpiSection {...kpiProps} />
    </div>
  ),
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div>
      <KpiSection {...kpiProps} />
    </div>
  ),
};

export const Expanded = {
  render: () => (
    <div>
      <KpiSection {...kpiProps} expanded />
    </div>
  ),
};

export const TrendDown = {
  render: () => (
    <div>
      <KpiSection
        {...kpiProps}
        netProfit={{
          value: '-$3,200.00',
          trend: { percent: 12, direction: 'down' },
        }}
      />
    </div>
  ),
};

export const TrendFlat = {
  render: () => (
    <div>
      <KpiSection
        {...kpiProps}
        netProfit={{
          value: '$12,450.00',
          trend: { percent: 0, direction: 'flat' as const },
        }}
      />
    </div>
  ),
};

export const InsufficientDataTrend = {
  render: () => (
    <div>
      <KpiSection {...kpiProps} netProfit={{ value: '$12,450.00' }} />
    </div>
  ),
};
