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
import InfoBoxComponent from '../../InfoBoxComponent';
import { dateRangeSelector } from '../../../containers/Finances/selectors';
import { Semibold } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { FROM_DATE, TO_DATE } from '../../Form/DateRangePicker';
import { dateRangeOptions } from '../../DateRangeSelector/constants';
import DateRange, { SUNDAY } from '../../../util/dateRange';

const isDateValid = (date) => {
  return date ? moment(date).isValid() : false;
};

const FinanceDateRangeSelector = ({ hideTooltip }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dateRange = useSelector(dateRangeSelector);
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
      newDateRange.option = dateRangeOptions.CUSTOM;
      newDateRange.startDate = startDate;
      newDateRange.endDate = endDate;
    }
    dispatch(setDateRange(newDateRange));
  };

  const onChangeDateRangeOption = (value) => {
    if (
      value === dateRangeOptions.CUSTOM &&
      Object.keys(customRange).some((date) => !isDateValid(date))
    ) {
      return;
    }
    const { startDate, endDate } = dateRangeUtil.getDates(value);
    dispatch(setDateRange({ option: value, startDate, endDate }));
  };

  return (
    <div className={styles.rangeContainer}>
      <div className={styles.titleContainer}>
        <Semibold style={{ textAlign: 'left', marginBottom: '20px' }}>
          {t('DATE_RANGE.TITLE')}
        </Semibold>
        {!hideTooltip && (
          <InfoBoxComponent
            customStyle={{ float: 'right' }}
            title={t('DATE_RANGE.HELP_TITLE')}
            body={t('DATE_RANGE.HELP_BODY')}
          />
        )}
      </div>

      <DateRangeSelector
        defaultDateRangeOptionValue={initialOption}
        defaultCustomDateRange={{ [FROM_DATE]: initialStartDate, [TO_DATE]: initialEndDate }}
        onChangeDateRangeOption={onChangeDateRangeOption}
        changeDateMethod={changeDate}
        dateRange={dateRange}
      />
    </div>
  );
};

export default FinanceDateRangeSelector;
