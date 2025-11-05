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

import { isValidHttpURLFormat } from '../../src/util/url.js';

const validUrls = [
  // Basic domains
  `example.com`,
  `www.example.com`,

  // With protocols
  `http://example.com`,
  `https://example.com`,
  `https://example.com/`,

  // With port
  `https://example.com:8000`,
  `https://example.com:8000/xxx`,

  // Subdomains and extras
  `http://subdomain.example.com`,
  `https://example.com/#`,
  `https://example.com/?hl=en`,
  `https://example.com/valid_url_example`,
];

const invalidUrls = [
  // Missing TLD (should have at least one dot and valid suffix)
  `example`,
  `www.example`,
  `https://www.example`,

  // Invalid or too-short TLD
  `example.c`,
  `https://example.c`,

  // Malformed domain or structure
  `https://..`,
  `mailto://example.com`, // unsupported scheme

  // Invalid or missing port syntax
  `https://example.com:`,
  `https://example.com:/`,
  `https://example.com:70000`, // out of valid port range
  `https://example.com:700abc/xxx`, // contains non-numeric chars
  `https://example.com:invalid_port/xxx`, // completely invalid port
];

describe('Test url utilities', () => {
  describe('isValidHttpURLFormat', () => {
    describe('Return true for valid URL', () => {
      test.each(validUrls)('%s', (url) => {
        const result = isValidHttpURLFormat(url);
        expect(result).toBe(true);
      });
    });

    describe('Return false for invalid URL', () => {
      test.each(invalidUrls)('%s', (url) => {
        const result = isValidHttpURLFormat(url);
        expect(result).toBe(false);
      });
    });
  });
});
