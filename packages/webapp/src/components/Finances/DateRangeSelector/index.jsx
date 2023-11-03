/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import DateRangeSelector from '../../DateRangeSelector';
import { setDateRange } from '../../../containers/Finances/actions';
import moment from 'moment';
import { dateRangeDataSelector } from '../../../containers/Finances/selectors';
import { FROM_DATE, TO_DATE } from '../../Form/DateRangePicker';
import { dateRangeOptions } from '../../DateRangeSelector/constants';
import DateRange, { SUNDAY } from '../../../util/dateRange';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const isDateValid = (date) => {
  return date ? moment(date).isValid() : false;
};

const FinanceDateRangeSelector = ({ className }) => {
  const dispatch = useDispatch();

  const dateRange = useSelector(dateRangeDataSelector);
  const { option, customRange = {} } = dateRange;
  const initialOption = option || dateRangeOptions.YEAR_TO_DATE;
  const dateRangeUtil = new DateRange(new Date(), SUNDAY);

  const initialStartDate = customRange.startDate && moment(customRange.startDate);
  const initialEndDate = customRange.endDate && moment(customRange.endDate);

  const changeDate = (type, date) => {
    const startDate = type === 'start' ? date : customRange.startDate;
    const endDate = type === 'end' ? date : customRange.endDate;

    const newDateRange = { customRange: { startDate, endDate } };

    // If both dates are valid, update dates and the option
    if ([startDate, endDate].every(isDateValid)) {
      newDateRange.startDate = startDate;
      newDateRange.endDate = endDate;
    }
    dispatch(setDateRange(newDateRange));
  };

  const onChangeDateRangeOption = (value) => {
    let newDateRange = {};
    if (value !== dateRangeOptions.CUSTOM) {
      newDateRange = dateRangeUtil.getDates(value);
    } else if (
      Object.keys(customRange).length === 2 &&
      Object.values(customRange).every((date) => date && isDateValid(date))
    ) {
      newDateRange = customRange;
    }
    dispatch(setDateRange({ option: value, ...newDateRange }));
  };

  return (
    <div className={clsx(styles.rangeContainer, className)}>
      <DateRangeSelector
        defaultDateRangeOptionValue={initialOption}
        defaultCustomDateRange={{ [FROM_DATE]: initialStartDate, [TO_DATE]: initialEndDate }}
        onChangeDateRangeOption={onChangeDateRangeOption}
        changeDateMethod={changeDate}
      />
    </div>
  );
};

FinanceDateRangeSelector.PropTypes = {
  className: PropTypes.string,
};

export default FinanceDateRangeSelector;
