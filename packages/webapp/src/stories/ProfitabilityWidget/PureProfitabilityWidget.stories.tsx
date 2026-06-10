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

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PureProfitabilityWidget from '../../components/ProfitabilityWidget';
import type { GroupBar } from '../../components/ProfitabilityWidget/RevenueExpenseBars';
import type { EntityProfitTableRow } from '../../components/ProfitabilityWidget/EntityProfitTable';
import { CtaVariant, EntityTab } from '../../components/ProfitabilityWidget/constants';
import type { KpiResult } from '../../containers/Home/ProfitabilityWidget/utils';
import { DateRangeOptions } from '../../components/DateRangeSelector/types';
import { componentDecorators } from '../Pages/config/Decorators';

const meta: Meta<typeof PureProfitabilityWidget> = {
  title: 'Components/ProfitabilityWidget/PureProfitabilityWidget',
  component: PureProfitabilityWidget,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof PureProfitabilityWidget>;

const kpis: KpiResult = {
  netProfit: 18250.75,
  totalRevenue: 42000,
  totalExpenses: 23749.25,
  margin: 43,
};

const yoyTrend = { percent: 12, direction: 'up' as const };

const revenueGroups: GroupBar[] = [
  { id: 'revenue_1', label: 'Crop sale', total: 30000, percentOfTotal: 71 },
  { id: 'revenue_2', label: 'Animal sale', total: 9000, percentOfTotal: 21 },
  { id: 'revenue_3', label: 'Custom revenue', total: 3000, percentOfTotal: 8 },
];

const expenseCategories: GroupBar[] = [
  { id: 'expense_1', label: 'Seeds', total: 12000, percentOfTotal: 51 },
  { id: 'expense_2', label: 'Labour', total: 8000, percentOfTotal: 34 },
  { id: 'expense_3', label: 'Fuel', total: 3749.25, percentOfTotal: 15 },
];

const cropRows: EntityProfitTableRow[] = [
  {
    id: 'crop_100',
    kind: 'crop',
    label: 'Yellow Carrot, Carrot',
    revenue: 1200,
    expense: 320,
    netProfit: 880,
  },
  {
    id: 'crop_101',
    kind: 'crop',
    label: 'Red Onion, Onion',
    revenue: 800,
    expense: 200,
    netProfit: 600,
  },
  {
    id: 'crop_103',
    kind: 'crop',
    label: 'Soybeans, Soybean',
    revenue: 0,
    expense: 1200,
    netProfit: -1200,
  },
];

const animalRows: EntityProfitTableRow[] = [
  {
    id: 'animal_50',
    kind: 'animal',
    label: 'Bessie',
    revenue: 2000,
    expense: 300,
    netProfit: 1700,
  },
  {
    id: 'batch_60',
    kind: 'animal',
    label: 'Spring Calves',
    revenue: 1200,
    expense: 150,
    netProfit: 1050,
  },
  {
    id: 'default_type_1',
    kind: 'animal',
    isTotal: true,
    label: 'All Cattle',
    revenue: 3200,
    expense: 450,
    netProfit: 2750,
  },
];

interface WrapperArgs {
  isLoading?: boolean;
  isEmpty?: boolean;
  hasAttributions?: boolean;
  hasCropVarieties?: boolean;
  hasAnimals?: boolean;
  initialExpanded?: boolean;
}

const Wrapper = ({
  isLoading = false,
  isEmpty = false,
  hasAttributions = true,
  hasCropVarieties = true,
  hasAnimals = true,
  initialExpanded = true,
}: WrapperArgs) => {
  const [entityTab, setEntityTab] = useState(EntityTab.CROPS);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const ctaVariant: CtaVariant = isEmpty
    ? 'noTransactions'
    : hasAttributions
      ? 'default'
      : 'noAttributions';

  return (
    <PureProfitabilityWidget
      isLoading={isLoading}
      isEmpty={isEmpty}
      ctaVariant={ctaVariant}
      hasAttributions={hasAttributions}
      hasCropVarieties={hasCropVarieties}
      hasAnimals={hasAnimals}
      kpis={kpis}
      yoyTrend={yoyTrend}
      revenueGroups={revenueGroups}
      expenseCategories={expenseCategories}
      tableRows={entityTab === EntityTab.CROPS ? cropRows : animalRows}
      currencySymbol="$"
      dateRange={{ option: DateRangeOptions.YEAR_TO_DATE }}
      availableYears={[2025, 2024, 2023]}
      updateDateRange={() => {}}
      entityTab={entityTab}
      isExpanded={isExpanded}
      onTabChange={setEntityTab}
      onToggleExpand={() => setIsExpanded((prev) => !prev)}
      onAddTransactions={() => {}}
    />
  );
};

export const Default: Story = { render: () => <Wrapper /> };

export const Collapsed: Story = { render: () => <Wrapper initialExpanded={false} /> };

export const Loading: Story = { render: () => <Wrapper isLoading /> };

export const NoTransactions: Story = { render: () => <Wrapper isEmpty /> };

export const NoAttributions: Story = { render: () => <Wrapper hasAttributions={false} /> };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Wrapper />,
};
