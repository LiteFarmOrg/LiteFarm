/*
 *  Copyright 2025 LiteFarm.org
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

import moment from 'moment';
import { DatePicker as MuiXDatePicker } from '@mui/x-date-pickers';
import { TimePicker as MuiXTimePicker } from '@mui/x-date-pickers/TimePicker';
import type { FieldOwnerState } from '@mui/x-date-pickers/models';
import clsx from 'clsx';
import styles from './styles.module.scss';
import InputBaseLabel, { InputBaseLabelProps } from '../../Form/InputBase/InputBaseLabel';
import Calendar from '../../../assets/images/dateInput/calendar.svg?react';
import Clock from '../../../assets/images/dateInput/clock.svg?react';
import { getLocaleDateTimeFormats } from './utils';

interface DateTimePickerProps extends InputBaseLabelProps {
  date: Date | string; // ISO string or Date object
  disabled?: boolean;
  className?: string;
}

const pickerSlotProps = {
  field: { openPickerButtonPosition: 'start' as const },
  textField: { fullWidth: true, className: styles.field },
  openPickerIcon: (ownerState: FieldOwnerState) => ({
    className: clsx(styles.icon, ownerState.isFieldDisabled && styles.iconDisabled),
  }),
};

export const DateInput = ({
  date,
  disabled = false,
  className,
  label,
  ...labelProps
}: DateTimePickerProps) => {
  const { dateFormat } = getLocaleDateTimeFormats();

  return (
    <div className={className}>
      {label && <InputBaseLabel label={label} {...labelProps} />}
      <MuiXDatePicker
        format={dateFormat}
        defaultValue={moment(date)}
        disabled={disabled}
        slots={{ openPickerIcon: Calendar }}
        slotProps={pickerSlotProps}
      />
    </div>
  );
};

export const TimeInput = ({
  date,
  disabled = false,
  className,
  label,
  ...labelProps
}: DateTimePickerProps) => {
  const { timeFormat, uses12HourFormat } = getLocaleDateTimeFormats();

  return (
    <div className={className}>
      {label && <InputBaseLabel label={label} {...labelProps} />}
      <MuiXTimePicker
        defaultValue={moment(date)}
        format={timeFormat}
        disabled={disabled}
        ampm={uses12HourFormat}
        slots={{ openPickerIcon: Clock }}
        slotProps={pickerSlotProps}
      />
    </div>
  );
};
