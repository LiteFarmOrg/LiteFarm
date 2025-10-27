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

/**
 * AI-assisted documentation
 *
 * Matches:
 * - 2025-05-15T14:30:59Z
 * - 2025-05-15T14:30:59.123Z
 * - 2025-05-15T14:30:59+02:00
 * - 2025-05-15T14:30:59.123-05:00
 *
 * Does NOT match:
 * - 2025-05-15 (date only)
 * - 2025-05-15T14:30 (missing seconds)
 * - Missing timezone (e.g., 2025-05-15T14:30:59)
 *
 * Not susceptible to RE-dos:
 * - No nested quantifiers
 * - All quantifiers (\d{n} and \d+) are bounded or isolated
 * - The regex is anchored at the start and end (^ and $)
 *
 * Potential Issues:
 * - 2025-99-99T99:99:99Z would match, even though it's invalid.
 * - Just matching Z or +00:00 doesn’t ensure your app interprets the timezone correctly unless you parse and normalize it.
 * - Millisecond flooding (extremely rare): The \d+ for milliseconds could theoretically match a very long string like .12345678901234567890... (most regex engines will cut off long matches anyway).
 *
 */
export function isISO8601Format(value: unknown): boolean {
  // https://stackoverflow.com/a/8270148/15876096
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  return typeof value === 'string' && iso8601Regex.test(value);
}

export function isSimpleDateFormat(value: unknown): boolean {
  // Regex to match YYYY-MM-DD format
  const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;

  return typeof value === 'string' && simpleDateRegex.test(value);
}

const VALID_EMAIL_REGEX = /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;

export const isValidEmail = (email: string): boolean => {
  return VALID_EMAIL_REGEX.test(email);
};

export const isValidURL = async (url: string) => {
  // TODO: LF-5011
  return !!url;
};
