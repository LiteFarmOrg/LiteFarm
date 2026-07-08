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

import { MarketDirectoryCertification, MarketProductCategory } from '../../src/models/types.js';

export interface DfcEntity {
  '@type': string;
  '@id': string;
  [key: string]: string | number | object;
}

export const expectedBaseDfcStructure = {
  '@context': expect.any(String),
  '@graph': expect.arrayContaining([
    expect.objectContaining({
      '@type': 'dfc-b:Organization',
      '@id': expect.stringContaining('/dfc/enterprises/'),
      'dfc-b:name': expect.any(String),
      'dfc-b:hasAddress': expect.any(String),
      'dfc-b:hasMainContact': expect.any(String),
    }),
    expect.objectContaining({
      '@type': 'dfc-b:Address',
      '@id': expect.any(String),
      'dfc-b:hasStreet': expect.any(String),
      'dfc-b:hasCity': expect.any(String),
    }),
    expect.objectContaining({
      '@type': 'dfc-b:Person',
      '@id': expect.any(String),
      'dfc-b:firstName': expect.any(String),
      'dfc-b:email': expect.any(String),
    }),
  ]),
};

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

export const mockParsedAddress = {
  street: '123 Farm Road',
  city: 'Farmville',
  region: 'BC',
  postalCode: 'V1V 1V1',
  country: 'Canada',
  countryCode: 'CA',
};

export const mockMarketProductCategoryMap = (): Map<number, MarketProductCategory> => {
  const enums = [{ id: 1, key: 'BAKERY' }];
  const map = new Map(enums.map((e) => [e.id, e]));
  return map;
};

export const mockCertification: MarketDirectoryCertification = {
  survey_id: 'mock-cert-uuid-001',
  certification_id: 1,
  certifier_id: 1,
  certificate_member_id: 'UK-ORG-05-1234',
  farm_id: 'mock-farm-id',
  certificationSystemType: {
    certification_id: 1,
    certification_type: 'Organic',
    certification_translation_key: 'ORGANIC',
  },
  certifier: {
    certifier_id: 1,
    certifier_name: 'Soil Association',
    certifier_acronym: 'SA',
  },
};

export const getOrganizationCount = (res: { body: { '@graph': DfcEntity[] } }) => {
  const graph: DfcEntity[] = res.body['@graph'];
  const organizations = graph.filter((e) => e['@type'] === 'dfc-b:Organization');
  return organizations.length;
};
