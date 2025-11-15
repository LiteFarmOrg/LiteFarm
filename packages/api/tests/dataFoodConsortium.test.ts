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

import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');

// Mock Google Maps calling dependency
jest.mock('../src/util/googleMaps.js', () => ({
  parseGoogleGeocodedAddress: jest.fn(),
}));

// Mock environment configuration
jest.mock('../src/util/environment.js', () => ({
  apiUrl: jest.fn(() => 'https://api.beta.litefarm.org'),
}));

import { parseGoogleGeocodedAddress } from '../src/util/googleMaps.js';
const mockedParseAddress = parseGoogleGeocodedAddress as jest.MockedFunction<
  typeof parseGoogleGeocodedAddress
>;

import mocks from './mock.factories.js';
import { createUserFarmIds } from './utils/testDataSetup.js';
import {
  expectedDfcStructure,
  mockCompleteMarketDirectoryInfo,
  mockMinimalMarketDirectoryInfo,
} from './utils/dfcUtils.js';

async function getDfcEnterpriseRequest(marketDirectoryInfoId: string) {
  return chai
    .request(server)
    .get(`/dfc/enterprise/${marketDirectoryInfoId}`)
    .set('content-type', 'application/json');
  // TODO LF-4997
  // .set('Authorization', `Bearer ${keycloakToken}`)
}

describe('Data Food Consortium Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedParseAddress.mockResolvedValue({
      street: '123 Farm Road',
      city: 'Farmville',
      region: 'BC',
      postalCode: 'V1V 1V1',
      country: 'Canada',
    });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET DFC-Formatted Market Directory Info Data', () => {
    test('Should return 200 with DFC-formatted data', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
        marketDirectoryInfo: mockCompleteMarketDirectoryInfo,
      });

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(200);

      const parsed = JSON.parse(res.text);
      expect(parsed).toMatchObject(expectedDfcStructure);
    });

    test('Should handle minimal market directory info', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
        marketDirectoryInfo: mockMinimalMarketDirectoryInfo,
      });

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(200);

      const parsed = JSON.parse(res.text);
      const enterprise = parsed['@graph'][0];

      expect(parsed['@context']).toBe('https://www.datafoodconsortium.org');
      expect(enterprise['@type']).toBe('dfc-b:Enterprise');
      expect(enterprise['dfc-b:name']).toBe('Minimal Farm');

      // Verify optional fields are not present for minimal data
      expect(enterprise['dfc-b:logo']).toBeUndefined();
      expect(enterprise['dfc-b:hasSocialMedia']).toBeUndefined();
      expect(enterprise['dfc-b:hasPhoneNumber']).toBeUndefined();

      // Verify required fields are present
      expect(enterprise['dfc-b:hasAddress']).toBeDefined();
      expect(enterprise['dfc-b:hasMainContact']).toBeDefined();
    });

    // Todo LF-4997
    test.skip('Should require keycloak authentication', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
        marketDirectoryInfo: mockMinimalMarketDirectoryInfo,
      });

      const res = await chai
        .request(server)
        // request without authorization headers
        .get(`/dfc/enterprise/${marketDirectoryInfo.id}`);

      expect(res.status).toBe(401);
    });
  });
});
