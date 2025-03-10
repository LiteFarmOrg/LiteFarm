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

import clsx from 'clsx';
import moment, { Moment } from 'moment';
import DateRange, { SUNDAY } from '../../util/dateRange';
import DateRangeSelector from '.';
import { DateRangeOptions } from './types';
import { FROM_DATE, TO_DATE } from '../Form/DateRangePicker';
import { DateRangeData } from './types';
import styles from './styles.module.scss';

/**
 * A wrapper component around DateRangeSelector that converts a semantic range (such as "Year to Date" or "Last 7 Days") into date values using the DateRange utility class.
 *
 * Pass either local (component) state or Redux-based state management
 */

interface SmartDateRangeSelectorProps {
  dateRange: DateRangeData;

  /**
   * When using Redux, ensure your reducer handles this action by merging the new values into the current state, for example:
   *
   *   updateDateRange(state, action: PayloadAction<Partial<DateRangeData>>) {
   *     state.date_range = { ...state.date_range, ...action.payload };
   *   }
   *
   * For local state (e.g., using useState), merge as follows
   *
   *   setDateRange((prev) => ({ ...prev, ...newDateRange }));
   */
  updateDateRange: (newDateRange: Partial<DateRangeData>) => void;

  defaultValue: DateRangeOptions;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
}

const isDateValid = (date: string | Moment | undefined): boolean => {
  return date ? moment(date).isValid() : false;
};

const SmartDateRangeSelector = ({
  dateRange,
  updateDateRange,
  onValidityChange,
  className,
  defaultValue = DateRangeOptions.YEAR_TO_DATE,
}: SmartDateRangeSelectorProps) => {
  const { option, customRange = {} } = dateRange;
  const initialOption = option || defaultValue;
  const dateRangeUtil = new DateRange(new Date(), SUNDAY);

  const initialStartDate = customRange.startDate ? moment(customRange.startDate) : undefined;
  const initialEndDate = customRange.endDate ? moment(customRange.endDate) : undefined;

  const changeDate = (type: 'start' | 'end', date: Moment) => {
    const startDate = type === 'start' ? date : customRange.startDate;
    const endDate = type === 'end' ? date : customRange.endDate;
    const newDateRange: DateRangeData = { customRange: { startDate, endDate } };

    // If both dates are valid, update the dates.
    if ([startDate, endDate].every(isDateValid)) {
      newDateRange.startDate = startDate;
      newDateRange.endDate = endDate;
    }

    updateDateRange(newDateRange);
  };

  const onChangeDateRangeOption = (value: DateRangeOptions) => {
    let newDateRange: DateRangeData = { option: value };
    if (value !== DateRangeOptions.CUSTOM) {
      newDateRange = { ...newDateRange, ...dateRangeUtil.getDates(value) };
    } else if (
      Object.keys(customRange).length === 2 &&
      Object.values(customRange).every((date) => date && isDateValid(date))
    ) {
      newDateRange = { ...newDateRange, ...customRange };
    }

    updateDateRange(newDateRange);
  };

  return (
    <div className={clsx(styles.rangeContainer, className)}>
      <DateRangeSelector
        defaultDateRangeOptionValue={initialOption}
        defaultCustomDateRange={{ [FROM_DATE]: initialStartDate, [TO_DATE]: initialEndDate }}
        onChangeDateRangeOption={onChangeDateRangeOption}
        changeDateMethod={changeDate}
        onValidityChange={onValidityChange}
      />
    </div>
  );
};

export default SmartDateRangeSelector;
