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

import isoCountries from 'i18n-iso-countries';

/**
 * Converts a 2-character ISO 3166-1 alpha-2 country code to a 3-character ISO 3166-1 alpha-3 code.
 *
 * @param countryCodeIso2 - The 2-character ISO 3166-1 alpha-2 country code (case-insensitive)
 * @returns The 3-character ISO 3166-1 alpha-3 country code, or undefined if conversion fails
 *
 */
export const convertCountryIso2ToIso3 = (countryCodeIso2?: string): string | undefined => {
  if (!countryCodeIso2) return undefined;

  const countryCodeIso3 = isoCountries.alpha2ToAlpha3(countryCodeIso2.toUpperCase());

  if (!countryCodeIso3) {
    console.warn(`Could not convert country code ${countryCodeIso2} to ISO alpha-3 format`);
  }

  return countryCodeIso3;
};
