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

import { emails, emailTransporter } from '../../src/templates/sendEmailTemplate.js';

const locales = ['en', 'es', 'fr', 'pt', 'de', 'hi', 'pa', 'ml', 'km', 'it'];

const locals = {
  first_name: 'Ana & Bo',
  farm_name: 'Smith & Sons "Farm"',
  buttonLink: 'https://example.com',
  imgBaseUrl: 'https://example.com',
  year: 2026,
  support_type: 'Other',
  message: 'Our "Tomatoes & Beans" plan is going great! <3',
  contact_method: 'email',
  contact: 'ana@example.com',
};

// An entity escaped a second time (e.g. &amp;quot;) shows up as literal text in the email
const doubleEscapedEntity = /&amp;#?\w+;/;

describe('Email templates', () => {
  const cases = Object.values(emails).flatMap(({ path }) =>
    locales.map((locale) => [path, locale]),
  );

  test.each(cases)('%s (%s) renders HTML entities only once', async (path, locale) => {
    const html = await emailTransporter.render(`${path}/html`, { ...locals, locale });

    expect(html).not.toMatch(doubleEscapedEntity);
  });

  test('renders quotes and the copyright sign in the password reset email', async () => {
    const html = await emailTransporter.render(`${emails.PASSWORD_RESET.path}/html`, {
      ...locals,
      locale: 'en',
    });

    expect(html).toContain('Click the &quot;Reset&quot; button');
    expect(html).toContain('&copy; 2026');
  });
});
