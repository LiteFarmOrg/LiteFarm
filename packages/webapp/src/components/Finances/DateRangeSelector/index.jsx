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

const FinanceDateRangeSelector = ({ changeDateMethod = () => ({}), hideTooltip }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dateRange = useSelector(dateRangeSelector);
  const initialOption = dateRange?.option || dateRangeOptions.YEAR_TO_DATE;

  let initialStartDate, initialEndDate;
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    initialStartDate = moment(dateRange.startDate);
    initialEndDate = moment(dateRange.endDate);
  }

  const changeDateMethodWithSetDateRange = (type, date) => {
    const newStartDate = type === 'start' ? date : dateRange.startDate;
    const newEndDate = type === 'end' ? date : dateRange.endDate;
    changeDateMethod(type, date);
    dispatch(setDateRange({ ...dateRange, startDate: newStartDate, endDate: newEndDate }));
  };

  const setDateRangeOptionValue = (value) => {
    dispatch(setDateRange({ ...dateRange, option: value }));
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
        setDateRangeOptionValue={setDateRangeOptionValue}
        changeDateMethod={changeDateMethodWithSetDateRange}
        dateRange={dateRange}
      />
    </div>
  );
};

export default FinanceDateRangeSelector;
