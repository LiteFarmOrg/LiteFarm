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

export const DIRECTORY_INFO_FIELDS = {
  // Only for form internal logic
  VALID_PLACE: 'valid_place',

  // Farm identity
  FARM_NAME: 'farm_name',
  ABOUT: 'about',
  LOGO: 'logo',

  // Farm representative
  CONTACT_FIRST_NAME: 'contact_first_name',
  CONTACT_LAST_NAME: 'contact_last_name',
  CONTACT_EMAIL: 'contact_email',

  // Farm store contact
  ADDRESS: 'address',
  COUNTRY_CODE: 'country_code',
  PHONE_NUMBER: 'phone_number',
  EMAIL: 'email',

  // Online presence
  WEBSITE: 'website',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  X: 'x',
} as const;

export type MarketDirectoryInfoFormFields = {
  [DIRECTORY_INFO_FIELDS.VALID_PLACE]: boolean;
  [DIRECTORY_INFO_FIELDS.FARM_NAME]: string;
  [DIRECTORY_INFO_FIELDS.ABOUT]?: string;
  [DIRECTORY_INFO_FIELDS.LOGO]?: string;
  [DIRECTORY_INFO_FIELDS.CONTACT_FIRST_NAME]: string;
  [DIRECTORY_INFO_FIELDS.CONTACT_LAST_NAME]?: string;
  [DIRECTORY_INFO_FIELDS.CONTACT_EMAIL]: string;
  [DIRECTORY_INFO_FIELDS.ADDRESS]: string;
  [DIRECTORY_INFO_FIELDS.COUNTRY_CODE]?: number;
  [DIRECTORY_INFO_FIELDS.PHONE_NUMBER]?: string;
  [DIRECTORY_INFO_FIELDS.EMAIL]?: string;
  [DIRECTORY_INFO_FIELDS.WEBSITE]?: string;
  [DIRECTORY_INFO_FIELDS.INSTAGRAM]?: string;
  [DIRECTORY_INFO_FIELDS.FACEBOOK]?: string;
  [DIRECTORY_INFO_FIELDS.X]?: string;
};
