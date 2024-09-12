/*
 *  Copyright (c) 2024 LiteFarm.org
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
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getDateInputFormat } from '../../../util/moment';
import DateRangePicker from '../../Form/DateRangePicker';
import Switch from '../../Form/Switch';
import styles from './styles.module.scss';

export function FilterDateRange({
  setDirty,
  defaultFromDate,
  defaultToDate,
  onDirty,
  subject,
  shouldReset,
  style,
  className,
  onChange,
}) {
  const [fromDate, setFromDate] = useState(defaultFromDate ?? '');
  const [toDate, setToDate] = useState(defaultToDate ?? '');

  useEffect(() => {
    if (shouldReset) {
      setFromDate('');
      setToDate('');
      onChange({ fromDate: undefined, toDate: undefined });
    }
  }, [shouldReset]);

  const [showDateFilter, setShowDateFilter] = useState(!!(defaultFromDate || defaultToDate));
  const onSwitchClick = () => {
    setDirty?.();
    if (showDateFilter) {
      onDirty?.();
      setShowDateFilter(false);
      setFromDate('');
      setToDate('');
    } else {
      setShowDateFilter(true);
      setFromDate(() => {
        if (defaultFromDate) return defaultFromDate;
        if (!defaultToDate) return getDateInputFormat();
      });
      setToDate(() => {
        if (defaultToDate) return defaultToDate;
        if (!defaultFromDate) {
          const toDate = new Date();
          toDate.setDate(toDate.getDate() + 7);
          return getDateInputFormat(toDate);
        }
      });
    }
  };
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    const filterState = {
      fromDate: e.target.value || undefined,
      toDate,
    };
    onChange(filterState);
    setDirty?.();
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    const filterState = {
      fromDate,
      toDate: e.target.value || undefined,
    };
    onChange(filterState);
    setDirty?.();
  };

  return (
    <div className={clsx([styles.container, className])} style={style}>
      <Switch label={subject} checked={showDateFilter} onChange={onSwitchClick} />
      {showDateFilter && (
        <>
          <DateRangePicker
            fromProps={{
              value: fromDate,
              onChange: handleFromDateChange,
            }}
            toProps={{
              value: toDate,
              onChange: handleToDateChange,
            }}
          />
        </>
      )}
    </div>
  );
}

FilterDateRange.propTypes = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  removable: PropTypes.bool,
  shouldReset: PropTypes.number,
  className: PropTypes.string,
  setDirty: PropTypes.func,
  defaultFromDate: PropTypes.string,
  defaultToDate: PropTypes.string,
  onDirty: PropTypes.func,
  subject: PropTypes.string,
  style: PropTypes.object,
  onChange: PropTypes.func,
};
