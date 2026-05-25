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

import { useState } from 'react';
import EntityProfitTable from '../../components/ProfitabilityWidget/EntityProfitTable';
import { EntityTab } from '../../components/ProfitabilityWidget/constants';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/EntityProfitTable',
  component: EntityProfitTable,
  decorators: componentDecorators,
};

const labels = {
  variety: 'Variety',
  animal: 'Animal',
  entity: 'Entity',
  revenue: 'Revenue',
  expense: 'Expense',
  netProfit: 'Net profit',
  notYet: 'Not yet',
  farmGeneral: 'Farm-generated expenses',
  tabs: { crops: 'Crops', animals: 'Animals', all: 'All' },
};

const allRows = [
  {
    id: 'crop_100',
    kind: 'crop' as const,
    label: 'Yellow Carrot',
    revenue: 1200,
    expense: 320,
    netProfit: 880,
  },
  {
    id: 'crop_101',
    kind: 'crop' as const,
    label: 'Red Carrot',
    revenue: 800,
    expense: 200,
    netProfit: 600,
  },
  {
    id: 'crop_102',
    kind: 'crop' as const,
    label: 'Heirloom Tomato',
    revenue: null,
    expense: 240,
    netProfit: -240,
  },
  {
    id: 'animal_50',
    kind: 'animal' as const,
    label: 'Bessie',
    revenue: 2000,
    expense: 300,
    netProfit: 1700,
  },
  {
    id: 'farm_general',
    kind: 'farm_general' as const,
    label: '',
    revenue: 250,
    expense: 175,
    netProfit: 75,
  },
];

export const AllTab = {
  render: () => {
    const [tab, setTab] = useState(EntityTab.ALL);
    return (
      <div style={{ maxWidth: 720 }}>
        <EntityProfitTable
          rows={allRows}
          entityTab={tab}
          onTabChange={setTab}
          currencySymbol="$"
          labels={labels}
        />
      </div>
    );
  },
};

export const CropsTab = {
  render: () => {
    const [tab, setTab] = useState(EntityTab.CROPS);
    return (
      <div style={{ maxWidth: 720 }}>
        <EntityProfitTable
          rows={allRows.filter((r) => r.kind === 'crop')}
          entityTab={tab}
          onTabChange={setTab}
          currencySymbol="$"
          labels={labels}
        />
      </div>
    );
  },
};
