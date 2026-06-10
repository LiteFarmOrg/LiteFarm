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
import { useTranslation } from 'react-i18next';
import ProfitabilityDateRangeSelector from './ProfitabilityDateRangeSelector';
import CallToActionBanner from './CallToActionBanner';
import EntityProfitTable, { EntityProfitTableRow } from './EntityProfitTable';
import ExpandableSection from './ExpandableSection';
import KpiSection, { KpiTrend } from './KpiSection';
import ProfitabilityWidgetSkeleton, {
  EntityProfitTableSkeleton,
} from './ProfitabilityWidgetSkeleton';
import RevenueExpenseBars, { GroupBar } from './RevenueExpenseBars';
import { CtaVariant, EntityTab } from './constants';
import { DateRangeData } from '../DateRangeSelector/types';
import type { KpiResult } from '../../containers/Home/ProfitabilityWidget/utils';
import styles from './styles.module.scss';

const formatCurrencyValue = (symbol: string, value: number): string => {
  const sign = value < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(value).toFixed(2)}`;
};

export interface PureProfitabilityWidgetProps {
  isLoading: boolean;
  isEmpty: boolean;
  ctaVariant: CtaVariant;
  hasAttributions: boolean;
  hasCropVarieties: boolean;
  hasAnimals: boolean;
  kpis: KpiResult;
  yoyTrend: KpiTrend | null;
  revenueGroups: GroupBar[];
  expenseCategories: GroupBar[];
  tableRows: EntityProfitTableRow[];
  currencySymbol: string;
  dateRange: DateRangeData;
  availableYears: number[];
  updateDateRange: (newDateRange: Partial<DateRangeData>) => void;
  entityTab: EntityTab;
  defaultExpanded?: boolean;
  onTabChange: (tab: EntityTab) => void;
  onAddTransactions: () => void;
}

const PureProfitabilityWidget = ({
  isLoading,
  isEmpty,
  ctaVariant,
  hasAttributions,
  hasCropVarieties,
  hasAnimals,
  kpis,
  yoyTrend,
  revenueGroups,
  expenseCategories,
  tableRows,
  currencySymbol,
  dateRange,
  availableYears,
  updateDateRange,
  entityTab,
  defaultExpanded = false,
  onTabChange,
  onAddTransactions,
}: PureProfitabilityWidgetProps) => {
  const { t } = useTranslation('profitability');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const formatCurrency = (value: number): string => formatCurrencyValue(currencySymbol, value);

  if (isLoading) {
    return <ProfitabilityWidgetSkeleton />;
  }

  const header = (
    <div className={styles.widgetHeader}>
      <h2 className={styles.widgetTitle}>{t('WIDGET_TITLE')}</h2>
      <ProfitabilityDateRangeSelector
        dateRange={dateRange}
        updateDateRange={updateDateRange}
        availableYears={availableYears}
        className={styles.dateRangeTrigger}
      />
    </div>
  );

  if (isEmpty) {
    return (
      <div className={styles.widget}>
        {header}
        <ProfitabilityWidgetSkeleton />
        <CallToActionBanner variant={ctaVariant} onAddTransactions={onAddTransactions} />
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      {header}

      <KpiSection
        expanded={isExpanded}
        netProfit={{
          value: formatCurrency(kpis.netProfit),
          ...(yoyTrend && { trend: yoyTrend }),
        }}
        totalRevenue={formatCurrency(kpis.totalRevenue)}
        totalExpenses={formatCurrency(kpis.totalExpenses)}
        margin={`${kpis.margin}%`}
      />

      <ExpandableSection isExpanded={isExpanded} onToggle={toggleExpand}>
        <div className={styles.expandableBodyContent}>
          <RevenueExpenseBars
            revenueGroups={revenueGroups}
            expenseCategories={expenseCategories}
            formatValue={formatCurrency}
          />
          {hasAttributions ? (
            <EntityProfitTable
              rows={tableRows}
              entityTab={entityTab}
              onTabChange={onTabChange}
              currencySymbol={currencySymbol}
              hasCropVarieties={hasCropVarieties}
              hasAnimals={hasAnimals}
            />
          ) : (
            <EntityProfitTableSkeleton entityTab={entityTab} onTabChange={onTabChange} />
          )}
        </div>
      </ExpandableSection>

      <CallToActionBanner variant={ctaVariant} onAddTransactions={onAddTransactions} />
    </div>
  );
};

export default PureProfitabilityWidget;
