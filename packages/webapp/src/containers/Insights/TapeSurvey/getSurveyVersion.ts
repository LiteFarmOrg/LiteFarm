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

const COUNTRY_VERSIONS = ['AU'];

/**
 * Returns the survey version key used to fetch the correct JSON from DO CDN,
 * based on the farm's 2-letter ISO country code.
 *
 * To add a new country-specific version:
 * 1. Upload `tape_surveys/<key>.json` to the DO Spaces bucket.
 * 2. Add a country_code to `COUNTRY_VERSIONS`.
 */
export const getSurveyVersion = (countryCode: string | undefined): string | undefined => {
  return countryCode && COUNTRY_VERSIONS.includes(countryCode) ? countryCode.toLowerCase() : 'fao';
};
