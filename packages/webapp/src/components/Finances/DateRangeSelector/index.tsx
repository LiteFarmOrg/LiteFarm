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

import clsx from 'clsx';
import moment, { Moment } from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '../../../containers/Finances/actions';
import { dateRangeDataSelector } from '../../../containers/Finances/selectors';
import DateRange, { SUNDAY } from '../../../util/dateRange';
import DateRangeSelector from '../../DateRangeSelector';
import { DateRangeOptions } from '../../DateRangeSelector/constants';
import { FROM_DATE, TO_DATE } from '../../Form/DateRangePicker';
import styles from './styles.module.scss';

interface CustomRange {
  startDate?: string | Moment;
  endDate?: string | Moment;
}

export interface FinanceDateRange {
  option?: DateRangeOptions;
  startDate?: string | Moment;
  endDate?: string | Moment;
  customRange?: CustomRange;
}

interface FinanceDateRangeSelectorProps {
  value?: FinanceDateRange;
  onChange?: (newDateRange: FinanceDateRange) => void;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
}

const isDateValid = (date: string | Moment | undefined): boolean => {
  return date ? moment(date).isValid() : false;
};

const FinanceDateRangeSelector: React.FC<FinanceDateRangeSelectorProps> = ({
  value,
  onChange,
  onValidityChange,
  className,
}) => {
  const dispatch = useDispatch();

  const dateRange: FinanceDateRange = value || useSelector(dateRangeDataSelector);
  const { option, customRange = {} } = dateRange;
  const initialOption = option || DateRangeOptions.YEAR_TO_DATE;
  const dateRangeUtil = new DateRange(new Date(), SUNDAY);

  const initialStartDate = customRange.startDate ? moment(customRange.startDate) : undefined;
  const initialEndDate = customRange.endDate ? moment(customRange.endDate) : undefined;

  const changeDate = (type: 'start' | 'end', date: Moment) => {
    const startDate = type === 'start' ? date : customRange.startDate;
    const endDate = type === 'end' ? date : customRange.endDate;

    const newDateRange: FinanceDateRange = { customRange: { startDate, endDate } };

    // If both dates are valid, update dates and the option
    if ([startDate, endDate].every(isDateValid)) {
      newDateRange.startDate = startDate;
      newDateRange.endDate = endDate;
    }
    onChange ? onChange(newDateRange) : dispatch(setDateRange(newDateRange));
  };

  const onChangeDateRangeOption = (value: DateRangeOptions) => {
    let newDateRange: FinanceDateRange = { option: value };
    if (value !== DateRangeOptions.CUSTOM) {
      newDateRange = { ...newDateRange, ...dateRangeUtil.getDates(value) };
    } else if (
      Object.keys(customRange).length === 2 &&
      Object.values(customRange).every((date) => date && isDateValid(date))
    ) {
      newDateRange = { ...newDateRange, ...customRange };
    }
    onChange ? onChange(newDateRange) : dispatch(setDateRange(newDateRange));
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

export default FinanceDateRangeSelector;
