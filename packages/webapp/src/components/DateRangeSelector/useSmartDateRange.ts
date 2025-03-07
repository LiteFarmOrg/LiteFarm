/*
 *  Copyright 2025 LiteFarm.org
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

import { useEffect } from 'react';
import DateRange from '../../util/dateRange';
import { DateRangeOptions, DateRangeSelection } from './types';
import { MONDAY, SUNDAY } from '../../util/dateRange';

/**
 * Returns startDate and endDate in state (local or Redux).
 * If they are not defined initially, set them using the DateRange utility class.
 */

interface useSmartDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
  defaultOption?: DateRangeOptions;
  dateRange: DateRangeSelection;
  updateDateRange: (dateRange: Partial<DateRangeSelection>) => void;
}

export default function useSmartDateRange({
  weekStartDate = SUNDAY,
  defaultOption = DateRangeOptions.YEAR_TO_DATE,
  dateRange,
  updateDateRange,
}: useSmartDateRangeProps): { startDate?: string | any; endDate?: string | any } {
  const dateRangeUtil = new DateRange(new Date(), weekStartDate);
  const option = dateRange.option || defaultOption;

  useEffect(() => {
    if ((!dateRange.startDate || !dateRange.endDate) && option !== DateRangeOptions.CUSTOM) {
      const { startDate, endDate } = dateRangeUtil.getDates(option);
      updateDateRange({ option: option, startDate, endDate });
    }
  }, []);

  return { startDate: dateRange.startDate, endDate: dateRange.endDate };
}
