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

export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export const VALID_EMAIL_REGEX = /^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;

/**
 * COPIED FROM BACKEND
 *
 * Checks whether a URL has a valid HTTP/HTTPS format (protocol optional).
 * Validates domain structure and optional port.
 * The URL must have at least <second-level domain>.<top-level domain>,
 * with the TLD at least 2 characters long.
 */
export const isValidHttpURLFormat = (url: string): boolean => {
  const domainNameAndPort = url.replace(/^(https?:\/\/)?(www\.)?/i, '')?.split('/')[0];
  const [domainName, portString] = domainNameAndPort.split(':');

  if (domainNameAndPort.includes(':') && (!portString || !isValidPortNumber(portString))) {
    return false;
  }

  try {
    new URL(`https://${domainNameAndPort}`);
    // Note: this constructor behaves differently between Node.js and browser environments (will not throw for invalid domains in browser). Consider adding a Storybook interaction test in the future for comprehensive validation coverage across all environments.
  } catch {
    return false;
  }

  return isValidDomainNameFormat(domainName);
};

const isValidPortNumber = (port: string | number): boolean => {
  const portNumber = Number(port);
  // Port Number Ranges https://www.rfc-editor.org/rfc/rfc6335#section-8.1.2
  return !(isNaN(portNumber) || portNumber < 1 || portNumber > 65535);
};

const isValidDomainNameFormat = (domain: string): boolean => {
  const labels = domain.split('.');
  const topLevelDomain = labels.length >= 2 && labels[labels.length - 1];

  return (
    !!topLevelDomain && topLevelDomain.length >= 2 && labels.every((label) => label.length > 0)
  );
};
