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

import { isValidUrl } from './url.js';

export enum Social {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  X = 'x',
}

export const SOCIAL_DOMAINS = {
  [Social.INSTAGRAM]: 'instagram.com',
  [Social.FACEBOOK]: 'facebook.com',
  [Social.X]: 'x.com',
};

export const SOCIALS = Object.values(Social);

export const validateAndExtractUsernameOrUrl = async (social: Social, usernameOrUrl: string) => {
  const domain = SOCIAL_DOMAINS[social];
  const isUrl = usernameOrUrl.includes(domain);
  const trimmedInput = isUrl ? usernameOrUrl.trim() : usernameOrUrl.trim().replace(/^@/, '');
  const urlToCheck = isUrl ? trimmedInput : `https://${domain}/${trimmedInput}`;

  return (await isValidUrl(urlToCheck)) ? trimmedInput : false;
};
