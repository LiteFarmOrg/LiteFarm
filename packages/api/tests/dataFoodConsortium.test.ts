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
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');

// Mock Keycloak service
jest.mock('../src/services/keycloak.js', () => ({
  verifyKeycloakToken: jest.fn(),
}));

import { verifyKeycloakToken } from '../src/services/keycloak.js';

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
  DfcEntity,
  expectedBaseDfcStructure,
  mockCompleteMarketDirectoryInfo,
  mockParsedAddress,
} from './utils/dfcUtils.js';
import type { MarketDirectoryPartner } from '../src/models/types.js';

describe('Data Food Consortium Tests', () => {
  const testClientId = 'test-client-id';
  const validToken = jwt.sign({ azp: testClientId, client_id: testClientId }, 'dummy-secret');

  let marketDirectoryPartner: MarketDirectoryPartner;

  async function createMarketDirectoryInfoForTest(partner?: MarketDirectoryPartner) {
    const userFarmIds = await createUserFarmIds(1);
    const [marketDirectoryInfo] = await mocks.market_directory_infoFactory({
      promisedUserFarm: Promise.resolve([userFarmIds]),
      marketDirectoryInfo: mockCompleteMarketDirectoryInfo,
    });

    const partnerToLink = partner || marketDirectoryPartner;

    // Link farm to market directory partner
    await mocks.market_directory_partner_permissionsFactory({
      promisedDirectoryInfo: Promise.resolve([marketDirectoryInfo]),
      promisedPartner: Promise.resolve([partnerToLink]),
    });

    // return market_directory_info for id used in single farm request
    return marketDirectoryInfo;
  }

  async function createPartnerWithAuth() {
    const [partner] = await mocks.market_directory_partnerFactory();

    // Append a UUID to ensure uniqueness
    const clientId = `${partner.key}-${faker.datatype.uuid()}`;

    await mocks.market_directory_partner_authFactory(
      { promisedPartner: Promise.resolve([partner]) },
      mocks.fakeMarketDirectoryPartnerAuth({
        client_id: clientId,
      }),
    );

    // Generate and return a JWT token with this client_id
    const token = jwt.sign({ azp: clientId, client_id: clientId }, 'dummy-secret');

    return { partner, token };
  }

  async function getDfcEnterpriseRequest(marketDirectoryInfoId: string, token = validToken) {
    return chai
      .request(server)
      .get(`/dfc/enterprises/${marketDirectoryInfoId}`)
      .set('content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  async function getAllClientEnterprisesRequest(token = validToken) {
    return chai
      .request(server)
      .get(`/dfc/enterprises/`)
      .set('content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  beforeAll(async () => {
    // Create a single market directory partner to use across tests
    [marketDirectoryPartner] = await mocks.market_directory_partnerFactory();

    await mocks.market_directory_partner_authFactory(
      { promisedPartner: Promise.resolve([marketDirectoryPartner]) },
      mocks.fakeMarketDirectoryPartnerAuth({
        client_id: testClientId,
      }),
    );
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedParseAddress.mockResolvedValue(mockParsedAddress);

    // Set up default successful mock for Keycloak
    mockedVerifyToken.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe("GET a single farm's DFC-Formatted market directory data", () => {
    test('Should return 200 with DFC-formatted data', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(200);

      expect(res.body).toMatchObject(expectedBaseDfcStructure);
    });

    test('Should return 404 when market directory info record does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const res = await getDfcEnterpriseRequest(nonExistentId);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Enterprise not found');
    });
  });

  describe("GET all of a directory partner's DFC-formatted market directory data", () => {
    test('Should return 200 with an array of DFC-formatted data', async () => {
      // Create a new partner to ensure clean test data
      const { partner, token } = await createPartnerWithAuth();

      await Promise.all([
        createMarketDirectoryInfoForTest(partner),
        createMarketDirectoryInfoForTest(partner),
        createMarketDirectoryInfoForTest(partner),
      ]);

      const res = await getAllClientEnterprisesRequest(token);

      expect(res.status).toBe(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);

      // Verify each item matches DFC structure
      res.body.forEach((enterprise: DfcEntity) => {
        expect(enterprise).toMatchObject(expectedBaseDfcStructure);
      });
    });

    test('Should return empty array when partner has no authorized farms', async () => {
      const { token } = await createPartnerWithAuth();

      await Promise.all([
        createMarketDirectoryInfoForTest(), // link farms to default partner
        createMarketDirectoryInfoForTest(),
        createMarketDirectoryInfoForTest(),
      ]);

      const res = await getAllClientEnterprisesRequest(token);

      expect(res.status).toBe(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('Should only return farms authorized for the requesting partner', async () => {
      const { partner, token } = await createPartnerWithAuth();

      await Promise.all([
        createMarketDirectoryInfoForTest(), // link farm to default partner
        createMarketDirectoryInfoForTest(partner),
        createMarketDirectoryInfoForTest(partner),
      ]);

      const res = await getAllClientEnterprisesRequest(token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('Should not return farms with sharing permissions revoked)', async () => {
      const { partner, token } = await createPartnerWithAuth();

      // Return one of the market directory info records
      const [marketDirectoryInfoOne] = await Promise.all([
        createMarketDirectoryInfoForTest(partner),
        createMarketDirectoryInfoForTest(partner),
      ]);

      const origRes = await getAllClientEnterprisesRequest(token);

      expect(origRes.status).toBe(200);
      expect(origRes.body).toHaveLength(2);

      // Soft delete the farm-market directory partner record (revoke sharing)
      await knex('market_directory_partner_permissions')
        .where({
          market_directory_info_id: marketDirectoryInfoOne.id,
          market_directory_partner_id: partner.id,
        })
        .update({ deleted: true });

      const res = await getAllClientEnterprisesRequest(token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('Keycloak authentication', () => {
    test('Should return 401 if Authorization header is missing', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      const res = await chai
        .request(server)
        .get(`/dfc/enterprises/${marketDirectoryInfo.id}`)
        .set('content-type', 'application/json');
      // Don't set Authorization header

      expect(res.status).toBe(401);
      expect(res.text).toBe('Missing or invalid Authorization header');
    });

    test('should return 404 when client_id is not found in partner auth table', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      // Create a JWT with unrecognized client_id
      const unknownClientToken = jwt.sign({ client_id: 'unrecognized-client-id' }, 'dummy-secret');

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id, unknownClientToken);

      expect(res.status).toBe(404);
      expect(res.text).toBe('client_id not recognized');
    });

    test('Should return 401 when token lacks client_id', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      // Create a token without client_id
      const noIdToken = jwt.sign({ sub: 'some-subject', iat: Date.now() }, 'dummy-secret');

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id, noIdToken);

      expect(res.status).toBe(401);
      expect(res.text).toBe('Missing client_id in token');
    });

    test('Should return 401 if token from valid client is expired', async () => {
      const marketDirectoryInfo = await createMarketDirectoryInfoForTest();

      mockedVerifyToken.mockRejectedValue(new Error('Token expired'));

      const res = await getDfcEnterpriseRequest(marketDirectoryInfo.id);

      expect(res.status).toBe(401);
      expect(res.text).toBe('Invalid or expired token');
    });
  });
});
