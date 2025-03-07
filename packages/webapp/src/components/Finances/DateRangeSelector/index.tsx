/*
 *  Copyright 2019, 2020, 2021, 2022, 2023, 2025 LiteFarm.org
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

import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '../../../containers/Finances/actions';
import { dateRangeDataSelector } from '../../../containers/Finances/selectors';
import { DateRangeOptions, DateRangeSelection } from '../../DateRangeSelector/types';
import SmartDateRangeSelector from '../../DateRangeSelector/SmartDateRangeSelector';

/* Finance-specific wrapper for SmartDateRangeSelector specifying the Finances Redux store slice
 *
 * Use passed in state if value + onChange are provided (e.g. in <Report />), or otherwise act on the Redux store slice
 */
interface FinancesDateRangeSelectorProps {
  value?: DateRangeSelection;
  onChange?: (newDateRange: Partial<DateRangeSelection>) => void;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
}

const FinancesDateRangeSelector = ({
  value,
  onChange,
  onValidityChange,
  className,
}: FinancesDateRangeSelectorProps) => {
  const dispatch = useDispatch();

  return (
    <SmartDateRangeSelector
      dateRange={value || useSelector(dateRangeDataSelector)}
      updateDateRange={
        onChange ||
        ((newDateRange: Partial<DateRangeSelection>) => dispatch(setDateRange(newDateRange)))
      }
      onValidityChange={onValidityChange}
      defaultValue={DateRangeOptions.YEAR_TO_DATE}
      className={className}
    />
  );
};

export default FinancesDateRangeSelector;
