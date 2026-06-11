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
import { CtaVariant, EntityTab } from '../../components/ProfitabilityWidget/constants';
import type { EntityProfitRow, KpiResult } from '../../containers/Home/ProfitabilityWidget/utils';
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
  { id: 'revenue_1', label: 'Crop sale', labelKey: null, total: 30000, percentOfTotal: 71 },
  { id: 'revenue_2', label: 'Animal sale', labelKey: null, total: 9000, percentOfTotal: 21 },
  { id: 'revenue_3', label: 'Custom revenue', labelKey: null, total: 3000, percentOfTotal: 8 },
];

const expenseCategories: GroupBar[] = [
  { id: 'expense_1', label: 'Seeds', labelKey: null, total: 12000, percentOfTotal: 51 },
  { id: 'expense_2', label: 'Labour', labelKey: null, total: 8000, percentOfTotal: 34 },
  { id: 'expense_3', label: 'Fuel', labelKey: null, total: 3749.25, percentOfTotal: 15 },
];

// Crop rows carry the variety name plus a crop translation key; the table
// joins them ("Yellow Carrot, Carrot") and re-resolves on language change.
const cropRows: EntityProfitRow[] = [
  {
    id: 'crop_100',
    kind: 'crop',
    cropVarietyId: 100,
    label: 'Yellow Carrot',
    cropTranslationKey: 'CARROT',
    revenue: 1200,
    expense: 320,
    netProfit: 880,
  },
  {
    id: 'crop_101',
    kind: 'crop',
    cropVarietyId: 101,
    label: 'Red Onion',
    cropTranslationKey: 'ONION',
    revenue: 800,
    expense: 200,
    netProfit: 600,
  },
  {
    id: 'crop_103',
    kind: 'crop',
    cropVarietyId: 103,
    label: 'Soybeans',
    cropTranslationKey: 'SOYBEAN',
    revenue: 0,
    expense: 1200,
    netProfit: -1200,
  },
];

const animalRows: EntityProfitRow[] = [
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
  // Custom animal type: no typeTranslationKey, so the table renders
  // t('TABLE.TYPE_TOTAL', { type: 'Cattle' }) -> "Cattle total".
  {
    id: 'custom_type_5',
    kind: 'animal',
    isTotal: true,
    defaultTypeId: null,
    customTypeId: 5,
    label: 'Cattle',
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
      defaultExpanded={initialExpanded}
      onTabChange={setEntityTab}
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
