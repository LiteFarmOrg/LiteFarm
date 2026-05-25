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

import RevenueExpenseBars from '../../components/ProfitabilityWidget/RevenueExpenseBars';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/RevenueExpenseBars',
  component: RevenueExpenseBars,
  decorators: componentDecorators,
};

const formatValue = (v: number) => `$${v.toFixed(2)}`;

export const Default = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RevenueExpenseBars
        revenueHeading="Revenue sources"
        expenseHeading="Top expense categories"
        revenueGroups={[
          { id: 'crop', label: 'Crop sales', total: 14200, percentOfMax: 100 },
          { id: 'animal', label: 'Animal sales', total: 8400, percentOfMax: 59 },
          { id: 'farm_general', label: 'Farm-general revenues', total: 2100, percentOfMax: 15 },
        ]}
        expenseCategories={[
          { id: 'labour', label: 'Labour', total: 6200, percentOfMax: 100 },
          { id: 'expense_1', label: 'Seeds', total: 2800, percentOfMax: 45 },
          { id: 'expense_2', label: 'Diesel', total: 1900, percentOfMax: 31 },
        ]}
        formatValue={formatValue}
      />
    </div>
  ),
};
