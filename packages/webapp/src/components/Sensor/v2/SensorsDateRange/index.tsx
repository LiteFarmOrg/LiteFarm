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

import { DateRangeOptions, DateRangeData } from '../../../DateRangeSelector/types';
import SmartDateRangeSelector from '../../../DateRangeSelector/SmartDateRangeSelector';

interface SensorsDateRangeSelectorProps {
  dateRange: DateRangeData;
  updateDateRange: (newDateRange: Partial<DateRangeData>) => void;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
}

const SensorsDateRangeSelector = ({
  dateRange,
  updateDateRange,
  onValidityChange,
  className,
}: SensorsDateRangeSelectorProps) => {
  return (
    <SmartDateRangeSelector
      dateRange={dateRange}
      updateDateRange={updateDateRange}
      onValidityChange={onValidityChange}
      defaultValue={DateRangeOptions.THIS_WEEK}
      className={className}
    />
  );
};

export default SensorsDateRangeSelector;
