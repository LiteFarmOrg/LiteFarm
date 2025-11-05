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

import { isUriSafeByWebRisk } from '../services/google.js';

export const isValidUrl = async (url: string): Promise<boolean> => {
  const trimmedURL = url.trim();
  return isValidHttpURLFormat(trimmedURL) && (await isUriSafeByWebRisk(trimmedURL));
};

/**
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
