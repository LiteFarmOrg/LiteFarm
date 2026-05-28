/*
 *  Copyright 2026 LiteFarm.org
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

import { TFunction } from 'i18next';
import { DateRangeOptions, DynamicDateRangeOption } from './types';
import i18n from '../../locales/i18n';

export interface DateRangeOptionEntry {
  value: string;
  label: string;
}

const getStaticLabels: () => Record<DateRangeOptions, string> = () => ({
  [DateRangeOptions.YEAR_TO_DATE]: i18n.t('DATE_RANGE_SELECTOR.YEAR_TO_DATE'),
  [DateRangeOptions.LAST_7_DAYS]: i18n.t('DATE_RANGE_SELECTOR.LAST_SEVEN_DAYS'),
  [DateRangeOptions.LAST_14_DAYS]: i18n.t('DATE_RANGE_SELECTOR.LAST_FOURTEEN_DAYS'),
  [DateRangeOptions.LAST_30_DAYS]: i18n.t('DATE_RANGE_SELECTOR.LAST_THIRTY_DAYS'),
  [DateRangeOptions.LAST_12_MONTHS]: i18n.t('DATE_RANGE_SELECTOR.LAST_12_MONTHS'),
  [DateRangeOptions.THIS_WEEK]: i18n.t('DATE_RANGE_SELECTOR.THIS_WEEK'),
  [DateRangeOptions.LAST_WEEK]: i18n.t('DATE_RANGE_SELECTOR.LAST_WEEK'),
  [DateRangeOptions.THIS_MONTH]: i18n.t('DATE_RANGE_SELECTOR.THIS_MONTH'),
  [DateRangeOptions.LAST_MONTH]: i18n.t('DATE_RANGE_SELECTOR.LAST_MONTH'),
  [DateRangeOptions.CUSTOM]: i18n.t('DATE_RANGE_SELECTOR.CUSTOM_RANGE'),
});

/**
 * Default static-option order rendered when no `allowedOptions` prop
 * is supplied. `LAST_12_MONTHS` is intentionally omitted here: it is
 * available only when callers explicitly include it via`allowedOptions`.
 */
const DEFAULT_OPTION_ORDER: DateRangeOptions[] = [
  DateRangeOptions.YEAR_TO_DATE,
  DateRangeOptions.LAST_7_DAYS,
  DateRangeOptions.LAST_14_DAYS,
  DateRangeOptions.LAST_30_DAYS,
  DateRangeOptions.THIS_WEEK,
  DateRangeOptions.LAST_WEEK,
  DateRangeOptions.THIS_MONTH,
  DateRangeOptions.LAST_MONTH,
  DateRangeOptions.CUSTOM,
];

/**
 * Build the list of options for the date-range dropdown.
 *
 * - When `allowedOptions` is omitted, the static set rendered today is used.
 *   When supplied, only those options are rendered, in the order given.
 * - When `dynamicOptions` are supplied, they are inserted immediately before
 *   the `CUSTOM` entry (or appended if no `CUSTOM` entry is present).
 */
export function buildDateRangeOptions(
  t: TFunction,
  allowedOptions?: DateRangeOptions[],
  dynamicOptions?: DynamicDateRangeOption[],
): DateRangeOptionEntry[] {
  const staticKeys = allowedOptions ?? DEFAULT_OPTION_ORDER;
  const staticLabels = getStaticLabels();
  const staticEntries: DateRangeOptionEntry[] = staticKeys.map((key) => ({
    value: key,
    label: staticLabels[key],
  }));

  if (!dynamicOptions?.length) {
    return staticEntries;
  }

  const dynamicEntries: DateRangeOptionEntry[] = dynamicOptions.map(({ value, label }) => ({
    value,
    label,
  }));
  const customIndex = staticEntries.findIndex((entry) => entry.value === DateRangeOptions.CUSTOM);
  if (customIndex === -1) {
    return [...staticEntries, ...dynamicEntries];
  }
  return [
    ...staticEntries.slice(0, customIndex),
    ...dynamicEntries,
    ...staticEntries.slice(customIndex),
  ];
}

/**
 * Returns true when `value` matches one of the built-in `DateRangeOptions`
 * enum values (as opposed to a caller-supplied dynamic option key).
 */
export function isStaticDateRangeOption(value: string): value is DateRangeOptions {
  return (Object.values(DateRangeOptions) as string[]).includes(value);
}

/**
 * Looks up a dynamic option's persisted `{ startDate, endDate }` by value.
 * Returns `null` when no match is found.
 */
export function findDynamicDateRange(
  value: string,
  dynamicOptions?: DynamicDateRangeOption[],
): Pick<DynamicDateRangeOption, 'startDate' | 'endDate'> | null {
  if (!dynamicOptions?.length) {
    return null;
  }
  const match = dynamicOptions.find((option) => option.value === value);
  if (!match) {
    return null;
  }
  return { startDate: match.startDate, endDate: match.endDate };
}
