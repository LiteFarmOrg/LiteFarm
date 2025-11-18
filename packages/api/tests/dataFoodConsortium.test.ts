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

// Mock Keycloak service functions
jest.mock('../src/services/keycloak.js', () => ({
  decodeTokenWithoutVerifying: jest.fn(),
  verifyKeycloakToken: jest.fn(),
}));

import { decodeTokenWithoutVerifying, verifyKeycloakToken } from '../src/services/keycloak.js';

const mockedDecodeToken = decodeTokenWithoutVerifying as jest.MockedFunction<
  typeof decodeTokenWithoutVerifying
>;
const mockedVerifyToken = verifyKeycloakToken as jest.MockedFunction<typeof verifyKeycloakToken>;

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
  expectedBaseDfcStructure,
  mockCompleteMarketDirectoryInfo,
  mockMinimalMarketDirectoryInfo,
  mockParsedAddress,
} from './utils/dfcUtils.js';

describe('Data Food Consortium Tests', () => {
  const testClientId = 'test-client-id';
  const validToken = 'valid.jwt.token';

  async function getDfcEnterpriseRequest(marketDirectoryInfoId: string) {
    return chai
      .request(server)
      .get(`/dfc/enterprise/${marketDirectoryInfoId}`)
      .set('content-type', 'application/json')
      .set('Authorization', `Bearer ${validToken}`);
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedParseAddress.mockResolvedValue(mockParsedAddress);

    // Set up default successful mocks for Keycloak
    mockedDecodeToken.mockReturnValue({
      azp: testClientId,
      client_id: testClientId,
    });
    mockedVerifyToken.mockResolvedValue(undefined);

    await mocks.market_directory_partner_authFactory(
      {},
      mocks.fakeMarketDirectoryPartnerAuth({
        client_id: testClientId,
      }),
    );
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
      expect(parsed).toMatchObject(expectedBaseDfcStructure);
    });
  });

  describe('Keycloak authentication', () => {
    test('Should return 401 if Authorization header is missing', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
        marketDirectoryInfo: mockMinimalMarketDirectoryInfo,
      });

      const res = await chai
        .request(server)
        .get(`/dfc/enterprise/${marketDirectoryInfo.id}`)
        .set('content-type', 'application/json');
      // Don't set Authorization header

      expect(res.status).toBe(401);
      expect(res.text).toBe('Missing or invalid Authorization header');
    });
  });
});
