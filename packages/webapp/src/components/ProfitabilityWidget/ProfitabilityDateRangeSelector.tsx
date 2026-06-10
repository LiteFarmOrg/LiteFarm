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

import { useMemo } from 'react';
import DateRangeSelector from '../DateRangeSelector';
import {
  DateRangeData,
  DateRangeOptions,
  DynamicDateRangeOption,
} from '../DateRangeSelector/types';
import { formatYearOption } from '../../containers/Home/ProfitabilityWidget/utils';

const PROFITABILITY_ALLOWED_OPTIONS: DateRangeOptions[] = [
  DateRangeOptions.YEAR_TO_DATE,
  DateRangeOptions.LAST_12_MONTHS,
  DateRangeOptions.CUSTOM,
];

export interface ProfitabilityDateRangeSelectorProps {
  dateRange: DateRangeData;
  updateDateRange: (newDateRange: Partial<DateRangeData>) => void;
  availableYears: number[];
  className?: string;
}

const ProfitabilityDateRangeSelector = ({
  dateRange,
  updateDateRange,
  availableYears,
  className,
}: ProfitabilityDateRangeSelectorProps) => {
  const dynamicOptions: DynamicDateRangeOption[] = useMemo(
    () => availableYears.map(formatYearOption),
    [availableYears],
  );

  return (
    <DateRangeSelector
      dateRange={dateRange}
      updateDateRange={updateDateRange}
      defaultValue={DateRangeOptions.YEAR_TO_DATE}
      allowedOptions={PROFITABILITY_ALLOWED_OPTIONS}
      dynamicOptions={dynamicOptions}
      className={className}
    />
  );
};

export default ProfitabilityDateRangeSelector;
