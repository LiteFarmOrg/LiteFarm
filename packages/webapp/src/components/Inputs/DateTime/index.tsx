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

import { useState } from 'react';
import moment from 'moment';
import { InputAdornment } from '@mui/material';
import { DatePicker as MuiXDatePicker } from '@mui/x-date-pickers';
import { TimePicker as MuiXTimePicker } from '@mui/x-date-pickers/TimePicker';
import clsx from 'clsx';
import styles from './styles.module.scss';
import InputBaseLabel, { InputBaseLabelProps } from '../../Form/InputBase/InputBaseLabel';
import { ReactComponent as Calendar } from '../../../assets/images/dateInput/calendar.svg';
import { ReactComponent as Clock } from '../../../assets/images/dateInput/clock.svg';
import { getLocaleDateTimeFormats } from './utils';

interface DateTimePickerProps extends InputBaseLabelProps {
  date: Date | string; // ISO string or Date object
  disabled?: boolean;
  className?: string;
}

const createSlotProps = (
  Icon: React.ElementType,
  handleOpen: React.Dispatch<React.SetStateAction<boolean>>,
  disabled: boolean,
) => ({
  textField: {
    fullWidth: true,
    InputProps: {
      classes: {
        disabled: styles.inputDisabled,
        focused: styles.inputFocusBorder,
        root: styles.input,
      },
      startAdornment: (
        <InputAdornment position="start">
          <Icon
            onClick={() => !disabled && handleOpen(true)}
            className={clsx(styles.icon, disabled && styles.disabled)}
          />
        </InputAdornment>
      ),
    },
  },
});

export const DateInput = ({
  date,
  disabled = false,
  className,
  label,
  ...labelProps
}: DateTimePickerProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { dateFormat } = getLocaleDateTimeFormats();

  return (
    <div className={className}>
      {label && <InputBaseLabel label={label} {...labelProps} />}
      <MuiXDatePicker
        format={dateFormat}
        defaultValue={moment(date)}
        disabled={disabled}
        open={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        slotProps={{
          ...createSlotProps(Calendar, setIsDatePickerOpen, disabled),
        }}
        slots={{ openPickerIcon: () => null }}
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
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const { timeFormat, uses12HourFormat } = getLocaleDateTimeFormats();

  return (
    <div className={className}>
      {label && <InputBaseLabel label={label} {...labelProps} />}
      <MuiXTimePicker
        defaultValue={moment(date)}
        format={timeFormat}
        disabled={disabled}
        open={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        ampm={uses12HourFormat}
        slotProps={createSlotProps(Clock, setIsTimePickerOpen, disabled)}
        slots={{ openPickerIcon: () => null }}
      />
    </div>
  );
};
