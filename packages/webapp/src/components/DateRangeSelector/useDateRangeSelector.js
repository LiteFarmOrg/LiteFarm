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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { dateRangeDataSelector } from '../../containers/Finances/selectors';
import DateRange, { MONDAY, SUNDAY } from '../../util/dateRange';
import { dateRangeOptions } from './constants';
import { setDateRange } from '../../containers/Finances/actions';

/**
 * Returns startDate and endDate in the store.
 * If they are not defined, set the default option and dates.
 */
export default function useDateRangeSelector({ weekStartDate = SUNDAY }) {
  const dateRange = useSelector(dateRangeDataSelector);
  const dispatch = useDispatch();

  const dateRangeUtil = new DateRange(new Date(), weekStartDate);
  const option = dateRange.option || dateRangeOptions.YEAR_TO_DATE;

  useEffect(() => {
    if ((!dateRange.startDate || !dateRange.endDate) && option !== dateRangeOptions.CUSTOM) {
      const { startDate, endDate } = dateRangeUtil.getDates(option);
      dispatch(setDateRange({ option, startDate, endDate }));
    }
  }, []);

  return { startDate: dateRange.startDate, endDate: dateRange.endDate };
}

useDateRangeSelector.propTypes = {
  weekStartDate: PropTypes.oneOf([SUNDAY, MONDAY]),
};
