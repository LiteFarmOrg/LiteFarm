/*
 *  Copyright 2023 LiteFarm.org
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
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { dateRangeSelector } from '../../containers/Finances/selectors';
import DateRange, { MONDAY, SUNDAY } from '../../util/dateRange';
import { dateRangeOptions } from './constants';
import { setDateRange } from '../../containers/Finances/actions';

/**
 * When dateRange option in Redux store is custom, returns startDate and endDate in the store.
 * Otherwise, returns dates by calculating them using DateRange class.
 */
export default function useDateRangeSelector({
  weekStartDate = SUNDAY,
  defaultOption = dateRangeOptions.YEAR_TO_DATE,
}) {
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const customDateRange = useSelector(dateRangeSelector);
  const dateRange = new DateRange(new Date(), weekStartDate);

  useEffect(() => {
    if (!customDateRange?.option) {
      setDateRange({ ...customDateRange, option: dateRangeOptions.YEAR_TO_DATE });
    }

    const option = customDateRange?.option || defaultOption;
    const { startDate, endDate } =
      option === dateRangeOptions.CUSTOM
        ? { startDate: customDateRange.startDate, endDate: customDateRange.endDate }
        : dateRange.getDates(option);

    setDates({ startDate, endDate });
  }, [customDateRange]);

  return dates;
}

useDateRangeSelector.propTypes = {
  weekStartDate: PropTypes.oneOf([SUNDAY, MONDAY]),
  defaultOption: PropTypes.oneOf(Object.values(dateRangeOptions)),
};
