/*
 *  Copyright 2023, 2025 LiteFarm.org
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
import { useDispatch, useSelector } from 'react-redux';
import { dateRangeDataSelector } from '../../../containers/Finances/selectors';
import { setDateRange } from '../../../containers/Finances/actions';
import { MONDAY, SUNDAY } from '../../../util/dateRange';
import { DateRangeOptions, DateRangeData } from '../../DateRangeSelector/types';
import useDateRange from '../../DateRangeSelector/useDateRange';

/* Finance-specific wrapper for useDateRange for use with the Finances Redux store slice */
interface UseFinancesDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
}

export default function useFinancesDateRange({ weekStartDate }: UseFinancesDateRangeProps): {
  startDate?: string | Moment;
  endDate?: string | Moment;
} {
  const dispatch = useDispatch();

  const dateRange: DateRangeData = useSelector(dateRangeDataSelector);

  return useDateRange({
    weekStartDate,
    dateRange,
    updateDateRange: (newDateRange: Partial<DateRangeData>) => dispatch(setDateRange(newDateRange)),
    defaultOption: DateRangeOptions.YEAR_TO_DATE,
  });
}
