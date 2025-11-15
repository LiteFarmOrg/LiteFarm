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

export const mockCompleteMarketDirectoryInfo = {
  farm_name: 'Happy Acres Farm',
  about: 'Organic vegetables since 2020',
  logo: 'https://example.com/logo.png',
  contact_first_name: 'John',
  contact_last_name: 'Farmer',
  contact_email: 'john@happyacres.com',
  address: '123 Farm Road, Farmville, BC V1V 1V1',
  country_code: 1,
  phone_number: '555-555-1234',
  email: 'info@happyacres.com',
  website: 'https://happyacres.com',
  instagram: 'happyacres',
  facebook: 'happyacresfarm',
  x: 'happyacres',
};

export const mockMinimalMarketDirectoryInfo = {
  farm_name: 'Minimal Farm',
  contact_first_name: 'Jane',
  contact_email: 'jane@minimal.com',
  address: '456 Farm Lane',
};

export const mockParsedAddress = {
  street: '123 Farm Road',
  city: 'Farmville',
  region: 'BC',
  postalCode: 'V1V 1V1',
  country: 'Canada',
};

export interface DfcEntity {
  '@type': string;
  '@id': string;
  [key: string]: string | number | boolean | object | undefined;
}

export const expectedDfcStructure = {
  '@context': 'https://www.datafoodconsortium.org',
  '@graph': expect.arrayContaining([
    expect.objectContaining({
      '@type': 'dfc-b:Enterprise',
      '@id': expect.stringContaining('/dfc/enterprise/'),
      'dfc-b:name': expect.any(String),
      'dfc-b:hasDescription': expect.any(String),
      'dfc-b:hasAddress': expect.objectContaining({
        '@id': expect.any(String),
      }),
      'dfc-b:hasMainContact': expect.objectContaining({
        '@id': expect.any(String),
      }),
    }),
  ]),
};
