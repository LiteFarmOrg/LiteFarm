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
import DateRangeDropdown from '../../../components/ProfitabilityWidget/DateRangeDropdown';
import CallToActionBanner from '../../../components/ProfitabilityWidget/CallToActionBanner';
import EntityProfitTable from '../../../components/ProfitabilityWidget/EntityProfitTable';
import ExpandableSection from '../../../components/ProfitabilityWidget/ExpandableSection';
import KpiSection from '../../../components/ProfitabilityWidget/KpiSection';
import ProfitabilityWidgetSkeleton from '../../../components/ProfitabilityWidget/ProfitabilityWidgetSkeleton';
import RevenueExpenseBars, {
  GroupBar,
} from '../../../components/ProfitabilityWidget/RevenueExpenseBars';
import { EntityTab } from '../../../components/ProfitabilityWidget/constants';
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
  const { t } = useTranslation('profitability');
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
      <DateRangeDropdown
        dateRange={dateRange}
        updateDateRange={updateDateRange}
        availableYears={availableYears}
        className={styles.dateRangeTrigger}
      />
    </div>
  );

  const ctaMessage = data.isEmpty
    ? t('CTA_BANNER.NO_TRANSACTIONS')
    : data.revenueGroups.some((g) => g.total > 0 && g.kind !== 'farm_general')
      ? t('CTA_BANNER.DEFAULT')
      : t('CTA_BANNER.NO_ATTRIBUTIONS');

  if (data.isEmpty) {
    return (
      <div className={styles.widget}>
        {header}
        <ProfitabilityWidgetSkeleton omitHeader />
        <CallToActionBanner
          message={ctaMessage}
          ctaLabel={t('CTA_BANNER.CTA')}
          onAddTransactions={() => history.push(FINANCES_HOME_URL)}
        />
      </div>
    );
  }

  const localisedRevenueGroups: GroupBar[] = data.revenueGroups.map((group) => ({
    id: group.kind,
    label: t(`REVENUE_GROUP.${group.label}`),
    total: group.total,
    percentOfTotal: group.percentOfTotal,
  }));

  const localisedExpenseCategories: GroupBar[] = data.topExpenseCategories.map((category) => ({
    id: category.id,
    label: category.labelKey ? t(category.labelKey) : category.label,
    total: category.total,
    percentOfTotal: category.percentOfTotal,
  }));

  const tableRows = data.entityRows.map((row) => ({
    id: row.id,
    kind: row.kind,
    label:
      row.kind === 'crop' && row.cropTranslationKey
        ? `${row.label}, ${t(`crop:${row.cropTranslationKey}`)}`
        : row.label,
    revenue: row.revenue,
    expense: row.expense,
    netProfit: row.netProfit,
  }));

  return (
    <div className={styles.widget}>
      {header}

      <KpiSection
        expanded={isExpanded}
        netProfit={{
          label: t('KPI.NET_PROFIT'),
          value: formatCurrencyValue(currencySymbol, data.kpis.netProfit),
          ...(data.yoyTrend && {
            trend: {
              percent: data.yoyTrend.percent,
              direction: data.yoyTrend.direction,
            },
          }),
        }}
        totalRevenue={{
          label: t('KPI.TOTAL_REVENUE'),
          value: formatCurrencyValue(currencySymbol, data.kpis.totalRevenue),
        }}
        totalExpenses={{
          label: t('KPI.TOTAL_EXPENSES'),
          value: formatCurrencyValue(currencySymbol, data.kpis.totalExpenses),
        }}
        margin={{
          label: t('KPI.MARGIN'),
          value: `${data.kpis.margin}%`,
        }}
      />

      <ExpandableSection
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
        expandedLabel={t('LESS_DATA')}
        collapsedLabel={t('MORE_DATA')}
      >
        <div className={styles.expandableBodyContent}>
          <RevenueExpenseBars
            revenueHeading={t('REVENUE_SOURCES')}
            expenseHeading={t('TOP_EXPENSE_CATEGORIES')}
            revenueGroups={localisedRevenueGroups}
            expenseCategories={localisedExpenseCategories}
            formatValue={(v) => formatCurrencyValue(currencySymbol, v)}
          />
          <EntityProfitTable
            rows={tableRows}
            entityTab={entityTab}
            onTabChange={setEntityTab}
            currencySymbol={currencySymbol}
          />
        </div>
      </ExpandableSection>

      <CallToActionBanner
        message={ctaMessage}
        ctaLabel={t('CTA_BANNER.CTA')}
        onAddTransactions={() => history.push(FINANCES_HOME_URL)}
      />
    </div>
  );
};

export default ProfitabilityWidget;
