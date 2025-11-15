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
import { formatFarmDataToDfcStandard } from '../../src/services/dfcAdapter.js';
import {
  DfcEntity,
  expectedDfcStructure,
  mockCompleteMarketDirectoryInfo,
  mockMinimalMarketDirectoryInfo,
  mockParsedAddress,
} from '../utils/dfcUtils.js';

// Mock external dependencies
jest.mock('../../src/util/googleMaps.js', () => ({
  parseGoogleGeocodedAddress: jest.fn(),
}));

// Mock environment configuration
jest.mock('../../src/util/environment.js', () => ({
  apiUrl: jest.fn(() => 'https://api.beta.litefarm.org'),
}));

import { parseGoogleGeocodedAddress } from '../../src/util/googleMaps.js';
const mockedParseAddress = parseGoogleGeocodedAddress as jest.MockedFunction<
  typeof parseGoogleGeocodedAddress
>;

describe('dfcAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedParseAddress.mockResolvedValue(mockParsedAddress);
  });

  test('should format complete market directory info', async () => {
    const result = await formatFarmDataToDfcStandard({
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);

    expect(parsed).toMatchObject(expectedDfcStructure);
  });

  test('should correctly map MarketDirectoryInfo fields to DFC properties', async () => {
    const result = await formatFarmDataToDfcStandard({
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);
    const enterprise = parsed['@graph'][0];

    expect(enterprise['dfc-b:name']).toBe('Happy Acres Farm');
    expect(enterprise['dfc-b:hasDescription']).toBe('Organic vegetables since 2020');
    expect(enterprise['dfc-b:email']).toBe('info@happyacres.com');
    expect(enterprise['dfc-b:websitePage']).toBe('https://happyacres.com');
  });

  test('should handle missing optional fields', async () => {
    const result = await formatFarmDataToDfcStandard({
      ...mockMinimalMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);
    const enterprise = parsed['@graph'][0];

    // Optional fields that weren't provided should not be present
    expect(enterprise['dfc-b:hasSocialMedia']).toBeUndefined();
    expect(enterprise['dfc-b:hasPhoneNumber']).toBeUndefined();
    expect(enterprise['dfc-b:email']).toBeUndefined();
    expect(enterprise['dfc-b:websitePage']).toBeUndefined();

    // Required fields should still be present
    expect(enterprise['dfc-b:name']).toBe('Minimal Farm');
    expect(enterprise['dfc-b:hasAddress']).toBeDefined();
    expect(enterprise['dfc-b:hasMainContact']).toBeDefined();
  });

  test('should construct correct semantic IDs for all entities', async () => {
    const semanticId = faker.datatype.uuid();
    const semanticTestData = {
      ...mockCompleteMarketDirectoryInfo,
      id: semanticId,
      farm_id: faker.datatype.uuid(),
    };

    const result = await formatFarmDataToDfcStandard(semanticTestData);
    const parsed = JSON.parse(result);
    const enterprise = parsed['@graph'][0];

    const baseUrl = `https://api.beta.litefarm.org/dfc/enterprise/${semanticId}`;

    expect(enterprise['@id']).toBe(baseUrl);

    // Test reference IDs on Enterprise
    expect(enterprise['dfc-b:hasAddress']['@id']).toBe(`${baseUrl}#address`);
    expect(enterprise['dfc-b:hasMainContact']['@id']).toBe(`${baseUrl}#person-mainContact`);
    expect(enterprise['dfc-b:hasPhoneNumber']['@id']).toBe(`${baseUrl}#phoneNumber`);

    // Test actual entity IDs in @graph
    const addressEntity = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Address',
    );
    expect(addressEntity['@id']).toBe(`${baseUrl}#address`);

    const personEntity = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Person',
    );
    expect(personEntity['@id']).toBe(`${baseUrl}#person-mainContact`);

    const phoneEntity = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:PhoneNumber',
    );
    expect(phoneEntity['@id']).toBe(`${baseUrl}#phoneNumber`);
  });

  test('should construct correct social media URLs', async () => {
    const socialTestData = {
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
      instagram: 'happyacres',
      facebook: 'happyacresfarm',
      x: 'happyacres_farm',
    };

    const result = await formatFarmDataToDfcStandard(socialTestData);
    const parsed = JSON.parse(result);

    // Filter the @graph to find all SocialMedia entities
    const socialMediaEntities = parsed['@graph'].filter(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:SocialMedia',
    );

    // Extract the URLs from the social media entities
    const socialUrls = socialMediaEntities.map((sm: DfcEntity) => sm['dfc-b:URL']);

    expect(socialUrls).toContain('https://www.instagram.com/happyacres/');
    expect(socialUrls).toContain('https://www.facebook.com/happyacresfarm/');
    expect(socialUrls).toContain('https://x.com/happyacres_farm/');
  });

  test('should use parsed address data correctly', async () => {
    mockedParseAddress.mockResolvedValue({
      street: 'Mocked Street',
      city: 'Mocked City',
      region: 'MC',
      postalCode: '12345',
      country: 'Mockedland',
    });

    const result = await formatFarmDataToDfcStandard({
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);

    // Find the Address entity in @graph
    const addressEntity = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Address',
    );

    expect(addressEntity['dfc-b:hasStreet']).toBe('Mocked Street');
    expect(addressEntity['dfc-b:hasCity']).toBe('Mocked City');
    expect(addressEntity['dfc-b:region']).toBe('MC');
    expect(addressEntity['dfc-b:hasPostalCode']).toBe('12345');
    expect(addressEntity['dfc-b:hasCountry']).toBe('Mockedland');
  });
});
