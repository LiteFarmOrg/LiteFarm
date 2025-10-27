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

import { isValidURL } from "../../api/src/util/validation.js";

export const SOCIALS = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  X: "x",
};

const SOCIAL_DOMAINS = {
  [SOCIALS.INSTAGRAM]: "instagram.com",
  [SOCIALS.FACEBOOK]: "facebook.com",
  [SOCIALS.X]: "x.com",
};

export const validateAndExtractUsernameOrUrl = async (
  social,
  usernameOrUrl
) => {
  const domain = SOCIAL_DOMAINS[social];
  const isUrl = usernameOrUrl.includes(domain);
  const trimmedInput = isUrl
    ? usernameOrUrl.trim()
    : usernameOrUrl.trim().replace(/^@/, "");
  const urlToCheck = isUrl ? trimmedInput : `https://${domain}/${trimmedInput}`;

  return (await isValidURL(urlToCheck)) ? trimmedInput : false;
};
