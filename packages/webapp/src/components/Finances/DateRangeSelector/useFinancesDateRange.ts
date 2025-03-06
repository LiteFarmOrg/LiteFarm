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
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { dateRangeDataSelector } from '../../../containers/Finances/selectors';
import { setDateRange } from '../../../containers/Finances/actions';
import DateRange, { MONDAY, SUNDAY } from '../../../util/dateRange';
import { DateRangeOptions } from '../../DateRangeSelector/constants';
import { DateRangeSelection } from './types';

interface UseFinancesDateRangeProps {
  weekStartDate?: typeof SUNDAY | typeof MONDAY;
}

/**
 * Returns startDate and endDate from the store.
 * If they are not defined, sets the default option and dates.
 */
export default function useFinancesDateRange({
  weekStartDate = SUNDAY,
}: UseFinancesDateRangeProps): { startDate?: string | Moment; endDate?: string | Moment } {
  const dateRange: DateRangeSelection = useSelector(dateRangeDataSelector);
  const dispatch = useDispatch();

  const dateRangeUtil = new DateRange(new Date(), weekStartDate);
  const option = dateRange.option || DateRangeOptions.YEAR_TO_DATE;

  useEffect(() => {
    if ((!dateRange.startDate || !dateRange.endDate) && option !== DateRangeOptions.CUSTOM) {
      const { startDate, endDate } = dateRangeUtil.getDates(option);
      dispatch(setDateRange({ option, startDate, endDate }));
    }
  }, []);

  return { startDate: dateRange.startDate, endDate: dateRange.endDate };
}

useFinancesDateRange.propTypes = {
  weekStartDate: PropTypes.oneOf([SUNDAY, MONDAY]),
};
