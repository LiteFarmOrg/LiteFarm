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

import { faker } from '@faker-js/faker';
import { formatFarmDataToDfcStandard } from '../../src/services/datafoodconsortium/dfcAdapter.js';
import {
  DfcEntity,
  expectedBaseDfcStructure,
  mockCompleteMarketDirectoryInfo,
  mockMarketProductCategoryMap,
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
import {
  MarketDirectoryInfo,
  MarketDirectoryInfoMarketProductCategory,
  MarketProductCategory,
} from '../../src/models/types.js';
import { WithoutFarmId, WithoutId, WithoutKeysInArray } from '../types.js';
const mockedParseAddress = parseGoogleGeocodedAddress as jest.MockedFunction<
  typeof parseGoogleGeocodedAddress
>;

type CompleteMarketDirectoryInfoReq = WithoutFarmId<WithoutId<MarketDirectoryInfo>> & {
  market_product_categories?: WithoutKeysInArray<
    MarketDirectoryInfoMarketProductCategory[],
    'market_directory_info_id'
  >;
};

const fakeMarketDirectoryInfoWithRelations = ({
  info,
  marketProductCategories = [],
  fakeId,
}: {
  info: CompleteMarketDirectoryInfoReq;
  marketProductCategories: MarketProductCategory[];
  fakeId: MarketDirectoryInfoMarketProductCategory['market_directory_info_id'];
}) => {
  return {
    ...info,
    market_product_categories: marketProductCategories.map((marketProductCategory) => ({
      market_product_category_id: marketProductCategory.id,
      market_directory_info_id: fakeId,
    })),
  };
};

describe('dfcAdapter', () => {
  const marketProductCategoryMap = mockMarketProductCategoryMap();
  const marketProductCategory = marketProductCategoryMap.get(
    marketProductCategoryMap.keys().toArray()[0],
  )!;
  beforeEach(() => {
    jest.clearAllMocks();
    mockedParseAddress.mockResolvedValue(mockParsedAddress);
  });

  test('should format complete market directory info', async () => {
    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockCompleteMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    expect(result).toMatchObject(expectedBaseDfcStructure);
  });

  test('should correctly map MarketDirectoryInfo fields to DFC properties', async () => {
    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockCompleteMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    expect(result).toMatchObject(expectedBaseDfcStructure);

    const enterprise = result['@graph'].find(
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
    // Only required fields supplied
    const mockMinimalMarketDirectoryInfo = {
      farm_name: 'Minimal Farm',
      contact_first_name: 'Jane',
      contact_email: 'jane@minimal.com',
      address: '456 Farm Lane',
    };

    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockMinimalMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    expect(result).toMatchObject(expectedBaseDfcStructure);

    const enterprise = result['@graph'].find(
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
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockCompleteMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId: semanticId,
      }),
      id: semanticId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);
    const graph = result['@graph'];
    const baseUrl = `https://api.beta.litefarm.org/dfc/enterprises/${semanticId}`;

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
      instagram: 'test_insta',
      facebook: 'test_facebook',
      x: 'test_x_handle',
    };
    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: socialTestData,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    // Filter the @graph to find all SocialMedia entities
    const socialMediaEntities = result['@graph'].filter(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:SocialMedia',
    );

    // Extract the URLs from the social media entities
    const socialUrls = socialMediaEntities.map((social: DfcEntity) => social['dfc-b:URL']);

    expect(socialUrls).toEqual(
      expect.arrayContaining([
        'https://www.instagram.com/test_insta/',
        'https://www.facebook.com/test_facebook/',
        // TODO: Restore to x.com when OFN updates their API
        'https://twitter.com/test_x_handle/',
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
      countryCode: 'ML', // Actual county code for Mali (MLI)
    };
    mockedParseAddress.mockResolvedValue(mockAddress);

    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockCompleteMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    const addressEntity = result['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Address',
    );

    expect(addressEntity).toMatchObject({
      'dfc-b:hasStreet': mockAddress.street,
      'dfc-b:hasCity': mockAddress.city,
      'dfc-b:region': mockAddress.region,
      'dfc-b:hasPostalCode': mockAddress.postalCode,
      'dfc-b:hasCountry': 'http://publications.europa.eu/resource/authority/country/MLI',
    });
  });

  test('should fallback to country name when ISO conversion fails', async () => {
    const mockAddress = {
      street: 'Test Street',
      city: 'Test City',
      region: 'TC',
      postalCode: '00000',
      country: 'Unknown Country',
      countryCode: 'XX', // Invalid code that won't convert
    };
    mockedParseAddress.mockResolvedValue(mockAddress);

    const fakeId = faker.datatype.uuid();
    const fakeData = {
      ...fakeMarketDirectoryInfoWithRelations({
        info: mockCompleteMarketDirectoryInfo,
        marketProductCategories: [marketProductCategory],
        fakeId,
      }),
      id: fakeId,
      farm_id: faker.datatype.uuid(),
    };
    const result = await formatFarmDataToDfcStandard(fakeData, marketProductCategoryMap);

    const addressEntity = result['@graph'].find(
      (entity: DfcEntity) => entity['@type'] === 'dfc-b:Address',
    );

    // Should fall back to country name when ISO code is invalid
    expect(addressEntity).toMatchObject({
      'dfc-b:hasCountry': 'Unknown Country',
    });
  });
});
