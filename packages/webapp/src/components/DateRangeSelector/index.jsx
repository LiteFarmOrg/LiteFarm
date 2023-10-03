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
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ClickAwayListener } from '@mui/material';
import { ReactComponent as Calendar } from '../../assets/images/dateInput/calendar.svg';
import CustomDateRangeSelector from './CustomDateRangeSelector';
import ReactSelect from '../Form/ReactSelect';
import { FROM_DATE, TO_DATE } from '../Form/DateRangePicker';
import { dateRangeOptions as rangeOptions } from './constants';
import styles from './styles.module.scss';

export default function DateRangeSelector({
  defaultDateRangeOptionValue,
  defaultCustomDateRange = {},
  placeholder,
  changeDateMethod,
}) {
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);

  const { t } = useTranslation();
  const selectRef = useRef(null);

  const [customFromDate, setCustomFromDate] = useState(undefined);
  const [customToDate, setCustomToDate] = useState(undefined);
  const [validRange, setValidRange] = useState(true);
  const [areValidDates, setAreValidDates] = useState(
    customFromDate?.isValid() && customToDate?.isValid(),
  );

  const isValid = !!(areValidDates && validRange && customFromDate && customToDate);

  const options = [
    { value: rangeOptions.THIS_YEAR, label: t('DATE_RANGE_SELECTOR.THIS_YEAR') },
    { value: rangeOptions.LAST_7_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_SEVEN_DAYS') },
    { value: rangeOptions.LAST_14_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_FOURTEEN_DAYS') },
    { value: rangeOptions.LAST_30_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_THIRTY_DAYS') },
    { value: rangeOptions.THIS_WEEK, label: t('DATE_RANGE_SELECTOR.THIS_WEEK') },
    { value: rangeOptions.LAST_WEEK, label: t('DATE_RANGE_SELECTOR.LAST_WEEK') },
    { value: rangeOptions.THIS_MONTH, label: t('DATE_RANGE_SELECTOR.THIS_MONTH') },
    { value: rangeOptions.LAST_MONTH, label: t('DATE_RANGE_SELECTOR.LAST_MONTH') },
    { value: rangeOptions.CUSTOM, label: t('DATE_RANGE_SELECTOR.CUSTOM_RANGE') },
  ];

  // set defaultCustomDateRange if exists
  useEffect(() => {
    if (defaultDateRangeOptionValue !== rangeOptions.CUSTOM) {
      return;
    }
    const { [FROM_DATE]: defaultFromDate, [TO_DATE]: defaultToDate } = defaultCustomDateRange;

    // if the range does not have both FROM_DATE and TO_DATE, reset the option to "this year"
    if (!defaultFromDate || !defaultToDate) {
      setSelectedDateRangeOption(options[0]);
      return;
    }

    setCustomFromDate(defaultFromDate);
    setCustomToDate(defaultToDate);
    setValidRange(defaultFromDate <= defaultToDate);
  }, []);

  useEffect(() => {
    setAreValidDates(customFromDate?.isValid() && customToDate?.isValid());
  }, [customFromDate, customToDate]);

  const formatOptionLabel = (data, formatOptionLabelMeta) => {
    if (formatOptionLabelMeta.context === 'menu') {
      const selected = formatOptionLabelMeta.selectValue[0]?.value === data.value;
      return <span className={selected ? styles.selectedMenuOptionInMenu : ''}>{data.label}</span>;
    }

    let formattedOption = data.label;
    let className = '';

    if (data.value === rangeOptions.CUSTOM) {
      if (isValid) {
        formattedOption = [customFromDate, customToDate]
          .map((date) => date.format('YYYY-MM-DD'))
          .join(' - ');
      } else {
        formattedOption = 'yyyy-mm-dd - yyyy-mm-dd';
        className = styles.invalid;
      }
    }

    return (
      <div className={styles.window}>
        <Calendar />
        <span className={clsx(styles.windowValue, className)}>{formattedOption}</span>
      </div>
    );
  };

  const setSelectedDateRangeOption = (option) => {
    selectRef.current.setValue(option);
  };

  const clearCustomDateRange = () => {
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
  };

  const onClickAway = () => {
    if (!isValid) {
      setSelectedDateRangeOption(options[0]);
    }
    setIsCustomDatePickerOpen(false);
  };

  const onBack = () => {
    setIsCustomDatePickerOpen(false);
    selectRef.current.focus();
  };

  const changeStartDate = (date) => {
    setValidRange(date <= customToDate);
    setCustomFromDate(date);
    changeDateMethod('start', date);
  };

  const changeEndDate = (date) => {
    setValidRange(customFromDate <= date);
    setCustomToDate(date);
    changeDateMethod('end', date);
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div className={styles.wrapper}>
        <ReactSelect
          ref={selectRef}
          options={options}
          placeholder={placeholder}
          openMenuOnFocus={true}
          onMenuOpen={() => setIsCustomDatePickerOpen(false)}
          onChange={(e) => {
            if (e?.value === rangeOptions.CUSTOM) {
              setIsCustomDatePickerOpen(true);
            }
          }}
          formatOptionLabel={formatOptionLabel}
          defaultValue={
            defaultDateRangeOptionValue &&
            options.find(({ value }) => value === defaultDateRangeOptionValue)
          }
        />
        {isCustomDatePickerOpen && (
          <CustomDateRangeSelector
            onBack={onBack}
            onClear={clearCustomDateRange}
            isValid={isValid}
            validRange={validRange}
            changeStartDate={changeStartDate}
            changeEndDate={changeEndDate}
            startDate={customFromDate}
            endDate={customToDate}
            fromDateMax={customToDate?.format('YYYY-MM-DD')}
            toDateMin={customFromDate?.format('YYYY-MM-DD')}
          />
        )}
      </div>
    </ClickAwayListener>
  );
}

DateRangeSelector.propTypes = {
  defaultDateRangeOptionValue: PropTypes.string,
  defaultCustomDateRange: PropTypes.shape({
    [FROM_DATE]: PropTypes.object,
    [TO_DATE]: PropTypes.object,
  }),
  placeholder: PropTypes.string,
  changeDateMethod: PropTypes.func,
};
