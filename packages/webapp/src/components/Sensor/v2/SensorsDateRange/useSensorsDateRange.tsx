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

import { useState } from 'react';
import moment from 'moment';
import { SUNDAY, MONDAY } from '../../../../util/dateRange';
import { DateRangeOptions, DateRangeData } from '../../../DateRangeSelector/types';
import useSmartDateRange from '../../../DateRangeSelector/useSmartDateRange';

/**
 * Initializes a local date range and returns its value and updater
 *
 * Returns the computed start and end dates (for calling componeont use) by running through the useSmartDateRange hook and converting to ISO 8601 strings
 */

interface UseSensorsDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
}

export default function useSensorsDateRange({ weekStartDate = SUNDAY }: UseSensorsDateRangeProps): {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  dateRange: DateRangeData;
  updateDateRange: (newDateRange: Partial<DateRangeData>) => void;
} {
  const [dateRange, setDateRange] = useState<DateRangeData>({});

  const updateDateRange = (newDateRange: Partial<DateRangeData>) => {
    setDateRange((prev) => ({ ...prev, ...newDateRange }));
  };

  const { startDate, endDate } = useSmartDateRange({
    weekStartDate,
    dateRange,
    updateDateRange,
    defaultOption: DateRangeOptions.THIS_WEEK,
  });

  return {
    startDate: startDate && moment(startDate).toISOString(),
    endDate: endDate && moment(endDate).toISOString(),
    dateRange,
    updateDateRange,
  };
}
