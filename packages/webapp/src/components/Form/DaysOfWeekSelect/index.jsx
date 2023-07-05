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

import React, { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Error } from '../../Typography';
import { useTranslation } from 'react-i18next';

const DaysOfWeekSelect = ({
  name,
  onChange,
  defaultValue,
  maxSelect = 1,
  disabled = false,
  errors,
  ...props
}) => {
  const { t } = useTranslation(['translation']);

  const daysOfWeek = [
    { label: t('DAYS_OF_WEEK_SELECT.SUNDAY'), value: 'Sunday' },
    { label: t('DAYS_OF_WEEK_SELECT.MONDAY'), value: 'Monday' },
    { label: t('DAYS_OF_WEEK_SELECT.TUESDAY'), value: 'Tuesday' },
    { label: t('DAYS_OF_WEEK_SELECT.WEDNESDAY'), value: 'Wednesday' },
    { label: t('DAYS_OF_WEEK_SELECT.THURSDAY'), value: 'Thursday' },
    { label: t('DAYS_OF_WEEK_SELECT.FRIDAY'), value: 'Friday' },
    { label: t('DAYS_OF_WEEK_SELECT.SATURDAY'), value: 'Saturday' },
  ];

  const [selected, setSelected] = useState(defaultValue ? defaultValue : []);

  const handleChange = (e, day) => {
    let updated = [...selected];

    // When maxSelect is 1 (the default), always update to last selection
    if (maxSelect == 1 && e.target.checked) {
      updated = [day];

      // If maxSelect > 1, allow selecting more up to the maxSelect
    } else if (maxSelect > 1 && e.target.checked && updated.length < maxSelect) {
      updated = [...selected, day];

      // Handle uncheck
    } else {
      updated = selected.filter((selectedDay) => selectedDay !== day);
    }

    // Send selections to React Hook Form
    if (onChange) {
      onChange(updated);
    }

    // Update component local state
    setSelected(updated);
  };

  return (
    <>
      <div className={clsx(styles.container, disabled && styles.disabled)}>
        {daysOfWeek.map((day) => (
          <React.Fragment key={day.value}>
            <input
              onChange={(e) => handleChange(e, day.value)}
              type={'checkbox'}
              disabled={disabled}
              id={day.value}
              value={day.value}
              checked={selected.includes(day.value)}
            />
            <label htmlFor={day.value} className={styles.checkmark}>
              <span className={styles.dayLetter}>{day.label}</span>
            </label>
          </React.Fragment>
        ))}
      </div>
      {errors && <Error className={clsx(styles.error)}>{errors}</Error>}
    </>
  );
};

DaysOfWeekSelect.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.array,
  maxSelect: PropTypes.number,
  disabled: PropTypes.bool,
  errors: PropTypes.string,
};

export default DaysOfWeekSelect;
