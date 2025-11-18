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

/* @ts-expect-error missing types */
import { faker } from '@faker-js/faker';
import { formatFarmDataToDfcStandard } from '../../src/services/dfcAdapter.js';
import {
  DfcEntity,
  expectedBaseDfcStructure,
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

    expect(parsed).toMatchObject(expectedBaseDfcStructure);
  });

  test('should correctly map MarketDirectoryInfo fields to DFC properties', async () => {
    const result = await formatFarmDataToDfcStandard({
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);

    expect(parsed).toMatchObject(expectedBaseDfcStructure);

    const enterprise = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Enterprise',
    );

    expect(enterprise).toMatchObject({
      'dfc-b:name': 'Happy Acres Farm',
      'dfc-b:hasDescription': 'Organic vegetables since 2020',
      'dfc-b:email': 'info@happyacres.com',
      'dfc-b:websitePage': 'https://happyacres.com',
    });
  });

  test('should handle missing optional fields', async () => {
    const result = await formatFarmDataToDfcStandard({
      ...mockMinimalMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);

    expect(parsed).toMatchObject(expectedBaseDfcStructure);

    const enterprise = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Enterprise',
    );

    // Optional fields that weren't provided should not be present
    const optionalKeys = [
      'dfc-b:hasSocialMedia',
      'dfc-b:hasPhoneNumber',
      'dfc-b:email',
      'dfc-b:websitePage',
    ];
    optionalKeys.forEach((key) => {
      expect(enterprise).not.toHaveProperty(key);
    });
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
    const graph = parsed['@graph'];
    const baseUrl = `https://api.beta.litefarm.org/dfc/enterprise/${semanticId}`;

    const findEntity = (type: string) =>
      graph.find((entity: DfcEntity) => entity['@type'] === type);

    expect(findEntity('dfc-b:Enterprise')).toMatchObject({
      '@id': baseUrl,
      'dfc-b:hasAddress': { '@id': `${baseUrl}#address` },
      'dfc-b:hasMainContact': { '@id': `${baseUrl}#person-mainContact` },
      'dfc-b:hasPhoneNumber': { '@id': `${baseUrl}#phoneNumber` },
    });

    // Test other entities in the graph
    expect(findEntity('dfc-b:Address')).toMatchObject({
      '@id': `${baseUrl}#address`,
    });

    expect(findEntity('dfc-b:Person')).toMatchObject({
      '@id': `${baseUrl}#person-mainContact`,
    });

    expect(findEntity('dfc-b:PhoneNumber')).toMatchObject({
      '@id': `${baseUrl}#phoneNumber`,
    });
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
    const socialUrls = socialMediaEntities.map((social: DfcEntity) => social['dfc-b:URL']);

    expect(socialUrls).toEqual(
      expect.arrayContaining([
        'https://www.instagram.com/happyacres/',
        'https://www.facebook.com/happyacresfarm/',
        'https://x.com/happyacres_farm/',
      ]),
    );
  });

  test('should use parsed address data correctly', async () => {
    const mockAddress = {
      street: 'Mocked Street',
      city: 'Mocked City',
      region: 'MC',
      postalCode: '12345',
      country: 'Mockedland',
    };
    mockedParseAddress.mockResolvedValue(mockAddress);

    const result = await formatFarmDataToDfcStandard({
      ...mockCompleteMarketDirectoryInfo,
      id: faker.datatype.uuid(),
      farm_id: faker.datatype.uuid(),
    });
    const parsed = JSON.parse(result);

    const addressEntity = parsed['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Address',
    );

    expect(addressEntity).toMatchObject({
      'dfc-b:hasStreet': mockAddress.street,
      'dfc-b:hasCity': mockAddress.city,
      'dfc-b:region': mockAddress.region,
      'dfc-b:hasPostalCode': mockAddress.postalCode,
      'dfc-b:hasCountry': mockAddress.country,
    });
  });
});
