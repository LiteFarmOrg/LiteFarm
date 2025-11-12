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

/* @ts-expect-error system dependent mystery type error */
import { faker } from '@faker-js/faker';
import {
  SOCIAL_DOMAINS,
  SOCIALS,
  validateSocialAndExtractUsername,
} from '../../src/util/socials.js';

const social1 = SOCIALS[0];
const social2 = SOCIALS[1];
const domain = SOCIAL_DOMAINS[social1];
const username = faker.internet.userName();

const invalidUsernames = [`/username`, 'user?name', 'username!', '@user@name'];

const validUrls = [
  `${domain}/${username}`,
  ` ${domain}/${username} `,
  `http://${domain}/${username}`,
  `https://${domain}/${username}`,
  `https://${domain}/${username}/`,
  `www.${domain}/${username}`,
  `http://www.${domain}/${username}`,
  `https://www.${domain}/${username}`,
  `https://${domain}/${username}/#`,
  `https://${domain}/${username}/?hl=en`,
  `https://${domain}/${username}/valid_url_example`,
];

const invalidUrls = [
  `${domain}`,
  `${domain}/`,
  `www.${domain}`,
  `www.${domain}/`,
  `https://${domain}`,
  `https://${domain}/`,
  `https://${domain}/?`,
  `https://${domain}/#`,
  `https://${domain}/ `,
  `https://${domain}/https://${domain}/${username}`,
  `http://${SOCIAL_DOMAINS[social2]}/${username}`,
  `https://${SOCIAL_DOMAINS[social2]}/${username}`,
  `https://www.${SOCIAL_DOMAINS[social2]}/${username}`,
];

describe('Test socials', () => {
  describe('validateSocialAndExtractUsername', () => {
    test('Returns username unchanged when input is plain username', () => {
      const result = validateSocialAndExtractUsername(social1, username);
      expect(result).toBe(username);
    });

    test('Strips @ prefix from username', () => {
      const result = validateSocialAndExtractUsername(social1, `@${username}`);
      expect(result).toBe(username);
    });

    describe('Return false for username with invalid character', () => {
      test.each(invalidUsernames)('%s', (invalidUsername) => {
        const result = validateSocialAndExtractUsername(social1, invalidUsername);
        expect(result).toBe(false);
      });
    });

    describe('Extract username for valid URL', () => {
      test.each(validUrls)('%s', (url) => {
        const result = validateSocialAndExtractUsername(social1, url);
        expect(result).toBe(username);
      });
      test.each(validUrls.map((url) => url.toUpperCase()))('%s', (url) => {
        const result = validateSocialAndExtractUsername(social1, url);
        expect(result).toBe(username.toUpperCase());
      });
    });

    describe('Return false for invalid URL', () => {
      test.each(invalidUrls)('%s', (url) => {
        const result = validateSocialAndExtractUsername(social1, url);
        expect(result).toBe(false);
      });
    });
  });
});
