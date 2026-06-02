/*
 *  Copyright 2023, 2025 LiteFarm.org
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

import { Moment } from 'moment';

export enum DateRangeOptions {
  YEAR_TO_DATE = 'year_to_date',
  LAST_7_DAYS = 'last_seven_days',
  LAST_14_DAYS = 'last_fourteen_days',
  LAST_30_DAYS = 'last_thirty_days',
  LAST_12_MONTHS = 'last_twelve_months',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom_range',
}

interface CustomRange {
  startDate?: string | Moment;
  endDate?: string | Moment;
}

export interface DynamicDateRangeOption {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface DateRangeData {
  /**
   * Identifier for the active range. May be one of the built-in
   * `DateRangeOptions` enum values, or a caller-supplied string key for an
   * entry passed in via `DateRangeSelector`'s `dynamicOptions` prop (for
   * example, `'year_2024'`).
   */
  option?: DateRangeOptions | string;
  startDate?: string | Moment;
  endDate?: string | Moment;
  customRange?: CustomRange;
}
