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
import { DateRangeOptions, DateRangeData } from './types';
import { MONDAY, SUNDAY } from '../../util/dateRange';

/**
 * Returns startDate and endDate in state (local or Redux).
 * For any semantic option (e.g. YEAR_TO_DATE), the dates are recomputed on mount
 * from the current date so they do not go stale when the underlying state is
 * persisted (e.g. via Redux Persist) across days. CUSTOM ranges are left as-is.
 */

interface useDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
  defaultOption?: DateRangeOptions;
  dateRange: DateRangeData;
  updateDateRange: (dateRange: Partial<DateRangeData>) => void;
}

export default function useDateRange({
  weekStartDate = SUNDAY,
  defaultOption = DateRangeOptions.YEAR_TO_DATE,
  dateRange,
  updateDateRange,
}: useDateRangeProps): { startDate?: string | any; endDate?: string | any } {
  const dateRangeUtil = new DateRange(new Date(), weekStartDate);
  const option = dateRange.option || defaultOption;

  useEffect(() => {
    if (option !== DateRangeOptions.CUSTOM) {
      const { startDate, endDate } = dateRangeUtil.getDates(option);
      updateDateRange({ option, startDate, endDate });
    }
  }, []);

  return { startDate: dateRange.startDate, endDate: dateRange.endDate };
}
