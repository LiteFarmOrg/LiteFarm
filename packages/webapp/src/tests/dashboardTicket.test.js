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
import { expect, describe, test } from 'vitest';
import { buildDashboardTicketUrl, getReturnToFromSearch } from '../util/dashboardTicket';

describe('getReturnToFromSearch', () => {
  test('returns the return address', () => {
    expect(getReturnToFromSearch('?return_to=https://data.litefarm.org/auth/finish')).toBe(
      'https://data.litefarm.org/auth/finish',
    );
  });

  test('decodes a percent-encoded value', () => {
    expect(
      getReturnToFromSearch('?return_to=https%3A%2F%2Fdata.litefarm.org%2Fauth%2Ffinish'),
    ).toBe('https://data.litefarm.org/auth/finish');
  });

  test('returns null for an empty search string', () => {
    expect(getReturnToFromSearch('')).toBe(null);
  });

  test('returns null when only other parameters are present', () => {
    expect(getReturnToFromSearch('?farm_id=abc&lang=es')).toBe(null);
  });

  test('returns null for a present but empty value', () => {
    expect(getReturnToFromSearch('?return_to=')).toBe(null);
  });
});

describe('buildDashboardTicketUrl', () => {
  test('attaches the ticket', () => {
    expect(buildDashboardTicketUrl('https://data.litefarm.org/auth/finish', 'abc.def.ghi')).toBe(
      'https://data.litefarm.org/auth/finish?ticket=abc.def.ghi',
    );
  });

  test('preserves an existing query string', () => {
    expect(
      buildDashboardTicketUrl('https://data.litefarm.org/auth/finish?next=%2Ffarms', 'abc.def.ghi'),
    ).toBe('https://data.litefarm.org/auth/finish?next=%2Ffarms&ticket=abc.def.ghi');
  });

  test('leaves the path intact', () => {
    expect(
      new URL(buildDashboardTicketUrl('https://data.litefarm.org/auth/finish', 'abc')).pathname,
    ).toBe('/auth/finish');
  });
});
