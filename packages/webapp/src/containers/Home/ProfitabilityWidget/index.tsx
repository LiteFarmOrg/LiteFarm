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

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { getExpense, getFarmExpenseType } from '../../Finances/actions';
import { getRevenueTypes, getSales } from '../../Finances/saga';
import { FINANCES_HOME_URL } from '../../../util/siteMapConstants';
import ProfitabilityDateRangeSelector from '../../../components/ProfitabilityWidget/ProfitabilityDateRangeSelector';
import CallToActionBanner from '../../../components/ProfitabilityWidget/CallToActionBanner';
import EntityProfitTable from '../../../components/ProfitabilityWidget/EntityProfitTable';
import ExpandableSection from '../../../components/ProfitabilityWidget/ExpandableSection';
import KpiSection from '../../../components/ProfitabilityWidget/KpiSection';
import ProfitabilityWidgetSkeleton, {
  EntityProfitTableSkeleton,
} from '../../../components/ProfitabilityWidget/ProfitabilityWidgetSkeleton';
import RevenueExpenseBars from '../../../components/ProfitabilityWidget/RevenueExpenseBars';
import type { GroupBar } from '../../../components/ProfitabilityWidget/RevenueExpenseBars';
import { CtaVariant, EntityTab } from '../../../components/ProfitabilityWidget/constants';
import { DateRangeData } from '../../../components/DateRangeSelector/types';
import useProfitabilityData from './useProfitabilityData';
import useProfitabilityDateRange from './useProfitabilityDateRange';
import styles from './styles.module.scss';

const formatCurrencyValue = (symbol: string, value: number): string => {
  const sign = value < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(value).toFixed(2)}`;
};

const ProfitabilityWidget = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation(['profitability', 'animal']);
  const currencySymbol = useCurrencySymbol();

  const [entityTab, setEntityTab] = useState<EntityTab>(EntityTab.CROPS);
  const [isExpanded, setIsExpanded] = useState(false);

  const { startDate, endDate, option, customRange, updateDateRange, availableYears } =
    useProfitabilityDateRange();

  const data = useProfitabilityData({
    startDate: typeof startDate === 'string' ? startDate : undefined,
    endDate: typeof endDate === 'string' ? endDate : undefined,
    entityTab,
  });

  useEffect(() => {
    dispatch(getSales());
    dispatch(getExpense());
    dispatch(getRevenueTypes());
    dispatch(getFarmExpenseType());
  }, [dispatch]);

  if (data.isLoading) {
    return <ProfitabilityWidgetSkeleton />;
  }

  const dateRange: DateRangeData = {
    option,
    startDate,
    endDate,
    customRange,
  };

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

  const ctaVariant: CtaVariant = data.isEmpty
    ? 'noTransactions'
    : data.hasAttributions
      ? 'default'
      : 'noAttributions';

  if (data.isEmpty) {
    return (
      <div className={styles.widget}>
        {header}
        <ProfitabilityWidgetSkeleton />
        <CallToActionBanner
          variant={ctaVariant}
          onAddTransactions={() => history.push(FINANCES_HOME_URL)}
        />
      </div>
    );
  }

  const localisedRevenueTypes: GroupBar[] = data.topRevenueTypes.map((type) => ({
    id: type.id,
    label: type.labelKey ? t(type.labelKey) : type.label,
    total: type.total,
    percentOfTotal: type.percentOfTotal,
  }));

  const localisedExpenseCategories: GroupBar[] = data.topExpenseCategories.map((category) => ({
    id: category.id,
    label: category.labelKey ? t(category.labelKey) : category.label,
    total: category.total,
    percentOfTotal: category.percentOfTotal,
  }));

  const tableRows = data.entityRows
    .map((row) => {
      let label = row.label;
      let isTotal = false;
      if (row.kind === 'crop' && row.cropTranslationKey) {
        label = `${row.label}, ${t(`crop:${row.cropTranslationKey}`)}`;
      } else if (row.kind === 'animal' && row.isTotal) {
        isTotal = true;
        const typeName = row.typeTranslationKey
          ? t(`animal:TYPE.${row.typeTranslationKey}`)
          : row.label;
        label = t('TABLE.TYPE_TOTAL', { type: typeName });
      }
      return {
        id: row.id,
        kind: row.kind,
        label,
        isTotal,
        revenue: row.revenue,
        expense: row.expense,
        netProfit: row.netProfit,
      };
    })
    // Sort total rows to the bottom, then alphabetically by label
    // (total rows are already pinned to bottom in table, but not mobile list)
    .sort((a, b) => {
      if (a.isTotal !== b.isTotal) {
        return a.isTotal ? 1 : -1;
      }
      return a.label.localeCompare(b.label);
    });

  return (
    <div className={styles.widget}>
      {header}

      <KpiSection
        expanded={isExpanded}
        netProfit={{
          value: formatCurrencyValue(currencySymbol, data.kpis.netProfit),
          ...(data.yoyTrend && {
            trend: {
              percent: data.yoyTrend.percent,
              direction: data.yoyTrend.direction,
            },
          }),
        }}
        totalRevenue={formatCurrencyValue(currencySymbol, data.kpis.totalRevenue)}
        totalExpenses={formatCurrencyValue(currencySymbol, data.kpis.totalExpenses)}
        margin={`${data.kpis.margin}%`}
      />

      <ExpandableSection isExpanded={isExpanded} onToggle={() => setIsExpanded((prev) => !prev)}>
        <div className={styles.expandableBodyContent}>
          <RevenueExpenseBars
            revenueGroups={localisedRevenueTypes}
            expenseCategories={localisedExpenseCategories}
            formatValue={(v) => formatCurrencyValue(currencySymbol, v)}
          />
          {data.hasAttributions ? (
            <EntityProfitTable
              rows={tableRows}
              entityTab={entityTab}
              onTabChange={setEntityTab}
              currencySymbol={currencySymbol}
              hasCropVarieties={data.hasCropVarieties}
              hasAnimals={data.hasAnimals}
            />
          ) : (
            <EntityProfitTableSkeleton entityTab={entityTab} onTabChange={setEntityTab} />
          )}
        </div>
      </ExpandableSection>

      <CallToActionBanner
        variant={ctaVariant}
        onAddTransactions={() => history.push(FINANCES_HOME_URL)}
      />
    </div>
  );
};

export default ProfitabilityWidget;
