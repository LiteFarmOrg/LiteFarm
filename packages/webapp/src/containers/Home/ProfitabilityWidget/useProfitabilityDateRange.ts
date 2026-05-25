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

import { Moment } from 'moment';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateRangeData, DateRangeOptions } from '../../../components/DateRangeSelector/types';
import useDateRange from '../../../components/DateRangeSelector/useDateRange';
import { MONDAY, SUNDAY } from '../../../util/dateRange';
import { expenseSelector, salesSelector } from '../../Finances/selectors';
import {
  ProfitabilityDateRangeState,
  profitabilityDateRangeDataSelector,
  updateDateRange,
} from './slice';
import { getAvailableYears } from './utils';

interface UseProfitabilityDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
}

interface UseProfitabilityDateRangeResult {
  startDate?: string | Moment;
  endDate?: string | Moment;
  option: DateRangeOptions | string;
  customRange?: ProfitabilityDateRangeState['customRange'];
  updateDateRange: (newDateRange: Partial<ProfitabilityDateRangeState>) => void;
  availableYears: number[];
}

export default function useProfitabilityDateRange({
  weekStartDate = SUNDAY,
}: UseProfitabilityDateRangeProps = {}): UseProfitabilityDateRangeResult {
  const dispatch = useDispatch();
  const dateRange = useSelector(profitabilityDateRangeDataSelector);
  const sales = useSelector(salesSelector);
  const expenses = useSelector(expenseSelector);

  const dispatchUpdate = useCallback(
    (newDateRange: Partial<ProfitabilityDateRangeState>) => {
      dispatch(updateDateRange(newDateRange));
    },
    [dispatch],
  );

  const { startDate, endDate } = useDateRange({
    weekStartDate,
    defaultOption: DateRangeOptions.YEAR_TO_DATE,
    dateRange: dateRange as DateRangeData,
    updateDateRange: dispatchUpdate as (range: Partial<DateRangeData>) => void,
  });

  const availableYears = useMemo(
    () => getAvailableYears(sales ?? [], expenses ?? []),
    [sales, expenses],
  );

  return {
    startDate,
    endDate,
    option: dateRange.option,
    customRange: dateRange.customRange,
    updateDateRange: dispatchUpdate,
    availableYears,
  };
}
