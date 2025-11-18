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
  mockParsedAddress,
} from './utils/dfcUtils.js';

describe('Data Food Consortium Tests', () => {
  const testClientId = 'test-client-id';
  const validToken = 'valid.jwt.token';

  async function createMarketDirectoryInfoForTest() {
    const userFarmIds = await createUserFarmIds(1);
    const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
      promisedUserFarm: Promise.resolve([userFarmIds]),
      marketDirectoryInfo: mockCompleteMarketDirectoryInfo,
    });
    return marketDirectoryInfo;
  }

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
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(200);

      const parsed = JSON.parse(res.text);
      expect(parsed).toMatchObject(expectedBaseDfcStructure);
    });
  });

  describe('Keycloak authentication', () => {
    test('Should return 401 if Authorization header is missing', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      const res = await chai
        .request(server)
        .get(`/dfc/enterprise/${marketDirectoryInfo.id}`)
        .set('content-type', 'application/json');
      // Don't set Authorization header

      expect(res.status).toBe(401);
      expect(res.text).toBe('Missing or invalid Authorization header');
    });

    test('should return 404 when client_id is not found in partner auth table', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      // Mock a valid token decode with unrecognized client_id
      mockedDecodeToken.mockReturnValue({
        client_id: 'unrecognized-client-id',
      });

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Market directory partner not found');
    });

    test('Should return 401 when token lacks client_id', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      // Mock a token that decodes successfully but has no client_id
      mockedDecodeToken.mockReturnValue({
        // No azp or client_id fields
        sub: 'some-subject',
        iat: Date.now(),
      });

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(401);
      expect(res.text).toBe('Missing client_id in token');
    });

    test('Should return 401 if token from valid client is expired', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      // Mock successful decode but failed verification
      mockedDecodeToken.mockReturnValue({
        client_id: testClientId,
      });
      mockedVerifyToken.mockRejectedValue(new Error('Token expired'));

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(401);
      expect(res.text).toBe('Invalid or expired token');
    });
  });
});
