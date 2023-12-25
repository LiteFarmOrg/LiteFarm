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
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Calendar } from '../../assets/images/dateInput/calendar.svg';
import { FROM_DATE, TO_DATE } from '../Form/DateRangePicker';
import ReactSelect from '../Form/ReactSelect';
import CustomDateRangeSelector from './CustomDateRangeSelector';
import { dateRangeOptions as rangeOptions } from './constants';
import styles from './styles.module.scss';

export default function DateRangeSelector({
  defaultDateRangeOptionValue,
  defaultCustomDateRange = {},
  onChangeDateRangeOption,
  placeholder,
  changeDateMethod,
  onValidityChange,
}) {
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [isCustomOptionSelected, setIsCustomOptionSelected] = useState(false);

  const { t } = useTranslation();
  const selectRef = useRef(null);

  const [customFromDate, setCustomFromDate] = useState(defaultCustomDateRange[FROM_DATE]);
  const [customToDate, setCustomToDate] = useState(defaultCustomDateRange[TO_DATE]);

  const isValidRange = customFromDate <= customToDate;
  const areValidDates = customFromDate?.isValid() && customToDate?.isValid();
  const isValid = !isCustomOptionSelected || !!(areValidDates && isValidRange);

  const options = [
    { value: rangeOptions.YEAR_TO_DATE, label: t('DATE_RANGE_SELECTOR.YEAR_TO_DATE') },
    { value: rangeOptions.LAST_7_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_SEVEN_DAYS') },
    { value: rangeOptions.LAST_14_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_FOURTEEN_DAYS') },
    { value: rangeOptions.LAST_30_DAYS, label: t('DATE_RANGE_SELECTOR.LAST_THIRTY_DAYS') },
    { value: rangeOptions.THIS_WEEK, label: t('DATE_RANGE_SELECTOR.THIS_WEEK') },
    { value: rangeOptions.LAST_WEEK, label: t('DATE_RANGE_SELECTOR.LAST_WEEK') },
    { value: rangeOptions.THIS_MONTH, label: t('DATE_RANGE_SELECTOR.THIS_MONTH') },
    { value: rangeOptions.LAST_MONTH, label: t('DATE_RANGE_SELECTOR.LAST_MONTH') },
    { value: rangeOptions.CUSTOM, label: t('DATE_RANGE_SELECTOR.CUSTOM_RANGE') },
  ];

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    if (!isValid & !isCustomDatePickerOpen) {
      setSelectedDateRangeOption(options[0]);
    }
  }, [isValid, isCustomDatePickerOpen]);

  useEffect(() => {
    setSelectedDateRangeOption(
      defaultDateRangeOptionValue &&
        options.find(({ value }) => value === defaultDateRangeOptionValue),
    );
  }, [defaultDateRangeOptionValue]);

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
        formattedOption = 'yyyy.mm.dd - yyyy.mm.dd';
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
    selectRef.current?.setValue(option);
  };

  const clearCustomDateRange = () => {
    setCustomFromDate(undefined);
    setCustomToDate(undefined);
  };

  const onClickAway = () => {
    if (!isCustomDatePickerOpen) {
      return;
    }
    setIsCustomDatePickerOpen(false);
  };

  const onBack = () => {
    setIsCustomDatePickerOpen(false);
    selectRef.current.focus();
  };

  const changeStartDate = (date) => {
    setCustomFromDate(date);
    changeDateMethod('start', date);
  };

  const changeEndDate = (date) => {
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
              setIsCustomOptionSelected(true);
            } else {
              setIsCustomOptionSelected(false);
            }
            clearCustomDateRange();
            onChangeDateRangeOption && e?.value && onChangeDateRangeOption(e.value);
          }}
          formatOptionLabel={formatOptionLabel}
          defaultValue={
            defaultDateRangeOptionValue &&
            options.find(({ value }) => value === defaultDateRangeOptionValue)
          }
          isSearchable={false}
        />
        {isCustomDatePickerOpen && (
          <CustomDateRangeSelector
            onBack={onBack}
            onClear={clearCustomDateRange}
            isValid={isValid}
            isValidRange={isValidRange}
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
  onChangeDateRangeOption: PropTypes.func,
  onValidityChange: PropTypes.func,
};
