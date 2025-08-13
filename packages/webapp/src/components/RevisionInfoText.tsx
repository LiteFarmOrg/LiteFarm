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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { Trans } from 'react-i18next';
import { getFirstNameWithLastInitial } from '../util';
import { getIntlDate } from '../util/date-migrate-TS';

/**
 * Formats a date string into a localized display format.
 * - If the date is in the current year, returns a short month–day format (e.g., "Aug 14").
 * - Otherwise, delegates to `getIntlDate` for a medium date format including the year.
 */
const formatDate = (date: string, language: Intl.LocalesArgument = 'en'): string => {
  if (new Date(date).getFullYear() === new Date().getFullYear()) {
    return new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(
      new Date(date),
    );
  }

  return getIntlDate(date, language);
};

interface RevisionInfoTextProps {
  revisionDate: string;
  reviser: { first_name: string; last_name: string };
  language: Intl.LocalesArgument;
}

export default function RevisionInfoText({
  revisionDate,
  reviser,
  language,
}: RevisionInfoTextProps) {
  return (
    <Trans
      i18nKey="common:REVISION_INFO"
      values={{
        date: formatDate(revisionDate, language),
        user: getFirstNameWithLastInitial(reviser),
      }}
      components={{
        strong: <strong />,
        i: <i />,
      }}
    />
  );
}
