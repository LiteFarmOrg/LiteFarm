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

export const Default = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <KpiSection
        netProfit={{
          label: 'Net profit',
          value: '$12,450.00',
          trend: { percent: 18.5, direction: 'up', suffixLabel: 'vs last year' },
        }}
        totalRevenue={{ label: 'Total revenue', value: '$24,800' }}
        totalExpenses={{ label: 'Total expenses', value: '$12,350' }}
        margin={{ label: 'Margin', value: '50%' }}
      />
    </div>
  ),
};
