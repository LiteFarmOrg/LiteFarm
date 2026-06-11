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
import type { EntityProfitRow } from '../../containers/Home/ProfitabilityWidget/utils';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/EntityProfitTable',
  component: EntityProfitTable,
  decorators: componentDecorators,
};

const allRows: EntityProfitRow[] = [
  {
    id: 'crop_100',
    kind: 'crop',
    cropVarietyId: 100,
    label: 'Yellow Carrot',
    revenue: 1200,
    expense: 320,
    netProfit: 880,
  },
  {
    id: 'crop_101',
    kind: 'crop',
    cropVarietyId: 101,
    label: 'Red Carrot',
    revenue: 800,
    expense: 200,
    netProfit: 600,
  },
  {
    id: 'crop_102',
    kind: 'crop',
    cropVarietyId: 102,
    label: 'Heirloom Tomato',
    revenue: 0,
    expense: 0,
    netProfit: 0,
  },
  {
    id: 'crop_103',
    kind: 'crop',
    cropVarietyId: 103,
    label: 'Soybeans',
    revenue: 0,
    expense: 1200,
    netProfit: -1200,
  },
  {
    id: 'animal_50',
    kind: 'animal',
    isTotal: false,
    label: 'Bessie',
    revenue: 2000,
    expense: 300,
    netProfit: 1700,
  },
  {
    id: 'batch_60',
    kind: 'animal',
    isTotal: false,
    label: 'Spring Calves',
    revenue: 1200,
    expense: 150,
    netProfit: 1050,
  },
  // Custom animal type: the table renders t('TABLE.TYPE_TOTAL', { type: 'Cattle' }).
  {
    id: 'custom_type_1',
    kind: 'animal',
    isTotal: true,
    defaultTypeId: null,
    customTypeId: 1,
    label: 'Cattle',
    revenue: 3200,
    expense: 450,
    netProfit: 2750,
  },
];

const filterByTab = (tab: EntityTab) => {
  if (tab === EntityTab.CROPS) {
    return allRows.filter((r) => r.kind === 'crop');
  }
  return allRows.filter((r) => r.kind === 'animal');
};

interface TemplateArgs {
  initialTab?: EntityTab;
  hasCropVarieties?: boolean;
  hasAnimals?: boolean;
}

const Template = ({
  initialTab = EntityTab.CROPS,
  hasCropVarieties = true,
  hasAnimals = true,
}: TemplateArgs) => {
  const [tab, setTab] = useState(initialTab);
  return (
    <div>
      <EntityProfitTable
        rows={filterByTab(tab)}
        entityTab={tab}
        onTabChange={setTab}
        currencySymbol="$"
        hasCropVarieties={hasCropVarieties}
        hasAnimals={hasAnimals}
      />
    </div>
  );
};

export const Default = {
  render: () => <Template />,
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Template />,
};

// A farm that has crop allocations but has no animals in its inventory.
export const NoAnimals = {
  render: () => <Template initialTab={EntityTab.ANIMALS} hasAnimals={false} />,
};

// A farm that has animal allocations but no crop varieties on the farm.
export const NoCropVarieties = {
  render: () => <Template initialTab={EntityTab.CROPS} hasCropVarieties={false} />,
};
