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
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { getExpense, getFarmExpenseType } from '../../Finances/actions';
import { getRevenueTypes, getSales } from '../../Finances/saga';
import { FINANCES_HOME_URL } from '../../../util/siteMapConstants';
import PureProfitabilityWidget from '../../../components/ProfitabilityWidget';
import { CtaVariant, EntityTab } from '../../../components/ProfitabilityWidget/constants';
import { DateRangeData } from '../../../components/DateRangeSelector/types';
import useProfitabilityData from './useProfitabilityData';
import useProfitabilityDateRange from './useProfitabilityDateRange';

const ProfitabilityWidget = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const currencySymbol = useCurrencySymbol();

  const [entityTab, setEntityTab] = useState<EntityTab>(EntityTab.CROPS);

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

  const dateRange: DateRangeData = {
    option,
    startDate,
    endDate,
    customRange,
  };

  const ctaVariant: CtaVariant = data.isEmpty
    ? 'noTransactions'
    : data.hasAttributions
      ? 'default'
      : 'noAttributions';

  return (
    <PureProfitabilityWidget
      isLoading={data.isLoading}
      isEmpty={data.isEmpty}
      ctaVariant={ctaVariant}
      hasAttributions={data.hasAttributions}
      hasCropVarieties={data.hasCropVarieties}
      hasAnimals={data.hasAnimals}
      kpis={data.kpis}
      yoyTrend={data.yoyTrend}
      revenueGroups={data.topRevenueTypes}
      expenseCategories={data.topExpenseCategories}
      tableRows={data.entityRows}
      currencySymbol={currencySymbol}
      dateRange={dateRange}
      availableYears={availableYears}
      updateDateRange={updateDateRange}
      entityTab={entityTab}
      onTabChange={setEntityTab}
      onAddTransactions={() => history.push(FINANCES_HOME_URL)}
    />
  );
};

export default ProfitabilityWidget;
