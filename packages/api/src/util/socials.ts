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

/**
 * Validates a social username or URL and extracts the username.
 *
 * This function handles:
 * - Full URLs with optional scheme (http/https) and optional "www."
 *   e.g., "https://www.instagram.com/username/?hl=en", "http://instagram.com/username/#"
 * - Direct usernames with or without a leading "@"
 *   e.g., "username", "@username"
 *
 * It rejects:
 * - Domain-only inputs, e.g., "instagram.com" or "www.instagram.com"
 * - Usernames containing invalid characters (only A-Z, a-z, 0-9, ".", "_", "-" are allowed)
 */
export const validateSocialAndExtractUsername = (social: Social, usernameOrUrl: string) => {
  const trimmedInput = usernameOrUrl.trim();
  const domain = SOCIAL_DOMAINS[social];

  // reject if it’s just the url without username
  if (new RegExp(`^(https?://)?(www.)?${domain}/?$`).test(trimmedInput)) {
    return false;
  }

  // Match URL: [http(s)://][www.]domain/{username}[optional trailing path or query]
  // Capture groups:
  // 1: http(s):// (optional)
  // 2: www. (optional)
  // 3: username ([A-Za-z0-9._-]+)
  // 4: trailing path/query (optional) ([/?#].*)? e.g., "/?hl=en", "/#"
  const urlMatch = trimmedInput.match(
    new RegExp(`^(https?://)?(www.)?${domain}/([A-Za-z0-9._-]+)([/?#].*)?$`),
  );

  if (urlMatch) {
    return urlMatch[3];
  }

  const username = trimmedInput.replace(/^@/, '');

  // validate allowed characters
  return /^[A-Za-z0-9._-]+$/.test(username) ? username : false;
};
