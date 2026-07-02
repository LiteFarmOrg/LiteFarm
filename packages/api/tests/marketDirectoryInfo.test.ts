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
import { faker } from '@faker-js/faker';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

// Mock partner webhook-calling service
jest.mock('../src/services/datafoodconsortium/dfcWebhook.js', () => ({
  notifyPartnerRefresh: jest.fn().mockResolvedValue(undefined),
}));

import { notifyPartnerRefresh } from '../src/services/datafoodconsortium/dfcWebhook.js';
const mockedNotifyPartnerRefresh = notifyPartnerRefresh as jest.MockedFunction<
  typeof notifyPartnerRefresh
>;

const INVALID_SUFFIX = '_INVALID';

jest.mock('../src/util/googleMaps.js', () => ({
  getAddressComponents: async (address: string) => {
    return address.endsWith(INVALID_SUFFIX) ? undefined : [{}];
  },
}));

jest.mock('../src/util/url.js', () => ({
  isValidUrl: async (url: string) => {
    return !url.endsWith(INVALID_SUFFIX);
  },
}));

import mocks from './mock.factories.js';
import { createUserFarmIds } from './utils/testDataSetup.js';
import { MarketDirectoryInfoReqBody } from '../src/middleware/validation/checkMarketDirectoryInfo.js';
import { SOCIAL_DOMAINS } from '../src/util/socials.js';
import { HeadersParams, WithoutFarmId, WithoutId, WithoutKeysInArray } from './types.js';
import {
  MarketDirectoryInfo,
  MarketDirectoryInfoMarketProductCategory,
  MarketDirectoryInfoWithRelations,
  MarketDirectoryPartner,
  MarketProductCategory,
} from '../src/models/types.js';

const fakeMarketDirectoryInfo = mocks.fakeMarketDirectoryInfo({
  logo: faker.internet.url(),
  about: faker.lorem.sentences(),
  contact_last_name: faker.name.lastName(),
  email: faker.internet.email(),
  country_code: Math.floor(Math.random() * 999) + 1,
  phone_number: faker.phone.number(),
  website: faker.internet.url(),
  instagram: faker.internet.userName(),
  facebook: faker.internet.userName(),
  x: faker.internet.userName(),
});

const marketDirectoryInfoOptionalFieldsNull = {
  logo: null,
  about: null,
  contact_last_name: null,
  email: null,
  country_code: null,
  phone_number: null,
  website: null,
  instagram: null,
  facebook: null,
  x: null,
};

type CompleteMarketDirectoryInfoReq = WithoutFarmId<WithoutId<MarketDirectoryInfo>> & {
  market_product_categories?: WithoutKeysInArray<
    MarketDirectoryInfoMarketProductCategory[],
    'market_directory_info_id'
  >;
};

const fakeMarketDirectoryInfoWithRelations = ({
  info,
  marketProductCategories = [],
}: {
  info: CompleteMarketDirectoryInfoReq;
  marketProductCategories: MarketProductCategory[];
}) => {
  return {
    ...info,
    market_product_categories: marketProductCategories.map((marketProductCategory) => ({
      market_product_category_id: marketProductCategory.id,
    })),
  };
};

const fakeInvalidString = (input: string = '') => `${input}${INVALID_SUFFIX}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const invalidTestCases: [string, any][] = [
  ['address', fakeInvalidString(faker.address.streetAddress())],
  ['website', fakeInvalidString(faker.internet.url())],
  ['contact_email', faker.lorem.word()],
  ['email', faker.lorem.word()],
  ['instagram', SOCIAL_DOMAINS['instagram']], // domain without username
  ['facebook', `/${faker.internet.userName()}`], // username with invalid character
  ['x', `https://${SOCIAL_DOMAINS['x']}/username!}`], // url with invalid username
  ['market_product_categories', null],
  ['market_product_categories', []],
];

// This helps with object comparison
const addMarketIdToRelation = (
  relation: WithoutKeysInArray<
    MarketDirectoryInfoMarketProductCategory[],
    'market_directory_info_id'
  >,
  id: MarketDirectoryInfo['id'],
) => {
  let marketProductCategoriesWithIds: MarketDirectoryInfoMarketProductCategory[] = [];
  if (Array.isArray(relation)) {
    marketProductCategoriesWithIds = relation.map(({ market_product_category_id }) => ({
      market_product_category_id,
      market_directory_info_id: id,
    }));
  }
  return marketProductCategoriesWithIds;
};

const expectMarketDirectoryInfo = (
  actualData: MarketDirectoryInfoWithRelations,
  expectedData: CompleteMarketDirectoryInfoReq,
) => {
  for (const property in expectedData) {
    const key = property as keyof typeof expectedData;
    if (key === 'market_product_categories' && Array.isArray(expectedData[key])) {
      const adjustedFakeData = addMarketIdToRelation(expectedData[key], actualData.id);
      expect(actualData[key]).toMatchObject(adjustedFakeData);
    } else {
      expect(actualData[key]).toBe(expectedData[key]);
    }
  }
};

async function getRequest({ user_id, farm_id }: HeadersParams) {
  return chai
    .request(server)
    .get('/market_directory_info')
    .set('content-type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

async function postRequest(data: MarketDirectoryInfoReqBody, { user_id, farm_id }: HeadersParams) {
  return chai
    .request(server)
    .post('/market_directory_info')
    .set('content-type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

async function patchRequest(
  id: string,
  data: MarketDirectoryInfoReqBody,
  { user_id, farm_id }: HeadersParams,
) {
  return await chai
    .request(server)
    .patch(`/market_directory_info/${id}`)
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

async function makeMarketDirectoryInfo(
  userFarmIds: HeadersParams,
  marketDirectoryInfo: CompleteMarketDirectoryInfoReq,
) {
  const { market_product_categories, ...filteredMarketDirectoryInfo } = marketDirectoryInfo;
  const [directoryInfo] = await mocks.market_directory_infoFactory({
    promisedUserFarm: Promise.resolve([userFarmIds]),
    marketDirectoryInfo: filteredMarketDirectoryInfo,
  });
  const marketProductCategories =
    market_product_categories?.map((category) => ({
      id: category.market_product_category_id,
    })) || [];
  for (const category of marketProductCategories) {
    await mocks.market_directory_info_market_product_categoryFactory({
      promisedMarketDirectoryInfo: Promise.resolve([directoryInfo]),
      promisedMarketProductCategory: Promise.resolve([category]),
    });
  }
  return directoryInfo.id;
}

describe('Market Directory Info Tests', () => {
  let marketDirectoryInfo: CompleteMarketDirectoryInfoReq;

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  beforeAll(async () => {
    const [marketProductCategory1] = await mocks.market_product_categoryFactory();
    marketDirectoryInfo = fakeMarketDirectoryInfoWithRelations({
      info: fakeMarketDirectoryInfo,
      marketProductCategories: [marketProductCategory1],
    });
  });

  describe('GET Market Directory Info', () => {
    let farm_id: HeadersParams['farm_id'];

    beforeAll(async () => {
      const userFarmIds = await createUserFarmIds(1);
      ({ farm_id } = userFarmIds);
      await makeMarketDirectoryInfo(userFarmIds, marketDirectoryInfo);
    });

    test('Admin users should be able to get market directory info', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const [{ user_id }] = await mocks.userFarmFactory({
          promisedFarm: Promise.resolve([{ farm_id }]),
          roleId: role,
        });

        const res = await getRequest({ farm_id, user_id });
        expect(res.status).toBe(200);
        expectMarketDirectoryInfo(res.body, marketDirectoryInfo);
      }
    });

    test('Worker should not be able to get market directory info', async () => {
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id }]),
        roleId: 3,
      });
      const res = await getRequest({ farm_id, user_id });
      expect(res.status).toBe(403);
    });

    test('Should get null when there is no market directory info', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const res = await getRequest(userFarmIds);
      expect(res.status).toBe(200);
      expect(res.body).toBe(null);
    });

    test('Should return partner_permissions with correct shape', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const marketDirectoryInfoId = await makeMarketDirectoryInfo(userFarmIds, marketDirectoryInfo);

      // Add two partners
      const [partner1] = await mocks.market_directory_partnerFactory();
      const [partner2] = await mocks.market_directory_partnerFactory();

      // Link partners to market directory info
      await knex('market_directory_partner_permissions').insert([
        {
          market_directory_info_id: marketDirectoryInfoId,
          market_directory_partner_id: partner1.id,
        },
        {
          market_directory_info_id: marketDirectoryInfoId,
          market_directory_partner_id: partner2.id,
        },
      ]);

      const res = await getRequest(userFarmIds);

      expect(res.status).toBe(200);

      expect(res.body.partner_permissions).toEqual(
        expect.arrayContaining([
          { market_directory_partner_id: partner1.id },
          { market_directory_partner_id: partner2.id },
        ]),
      );
      expect(res.body.partner_permissions).toHaveLength(2);
    });
  });

  describe('POST Market Directory Info', () => {
    test('Admin users should be able to create a market directory info', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await postRequest(marketDirectoryInfo, userFarmIds);

        expect(res.status).toBe(201);
        expectMarketDirectoryInfo(res.body, marketDirectoryInfo);
      }
    });

    test('Worker should not be able to create a market directory info', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await postRequest(marketDirectoryInfo, userFarmIds);

      expect(res.status).toBe(403);
    });

    test('Should return 409 conflict if market directory info already exists', async () => {
      const userFarmIds = await createUserFarmIds(1);
      await mocks.market_directory_infoFactory({
        promisedUserFarm: Promise.resolve([userFarmIds]),
      });

      const res = await postRequest(marketDirectoryInfo, userFarmIds);
      expect(res.status).toBe(409);
    });

    describe('Should return 400 for invalid data', () => {
      test.each(invalidTestCases)('%s', async (property, data) => {
        const userFarmIds = await createUserFarmIds(1);
        const res = await postRequest({ ...marketDirectoryInfo, [property]: data }, userFarmIds);

        expect(res.status).toBe(400);

        if (!res.error) {
          throw new Error('Expected an error'); // type guard
        }

        expect(res.error.text).toBe(`Invalid ${property}`);
      });
    });
  });

  describe('PATCH Market Directory Info', () => {
    let userFarmIds: HeadersParams;
    let farm_id: HeadersParams['farm_id'];
    let marketDirectoryInfoId: string;

    beforeEach(async () => {
      userFarmIds = await createUserFarmIds(1);
      ({ farm_id } = userFarmIds);
      marketDirectoryInfoId = await makeMarketDirectoryInfo(userFarmIds, marketDirectoryInfo);
    });

    test('Admin users should be able to edit a market directory info', async () => {
      const adminRoles = [1, 2, 5];
      const editAbout = { about: faker.lorem.sentences() };

      for (const role of adminRoles) {
        const [{ user_id }] = await mocks.userFarmFactory({
          promisedFarm: Promise.resolve([{ farm_id }]),
          roleId: role,
        });
        const res = await patchRequest(marketDirectoryInfoId, editAbout, {
          farm_id,
          user_id,
        });

        expect(res.status).toBe(204);

        const getRes = await getRequest({ farm_id, user_id });
        expectMarketDirectoryInfo(getRes.body, { ...marketDirectoryInfo, ...editAbout });
      }
    });

    test('Should be able to remove optional fields', async () => {
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id }]),
        roleId: 1,
      });

      const res = await patchRequest(marketDirectoryInfoId, marketDirectoryInfoOptionalFieldsNull, {
        user_id,
        farm_id,
      });

      expect(res.status).toBe(204);
      const getRes = await getRequest({ farm_id, user_id });
      expectMarketDirectoryInfo(getRes.body, {
        ...marketDirectoryInfo,
        ...marketDirectoryInfoOptionalFieldsNull,
      });
    });

    test('Worker should not be able to edit a market directory info', async () => {
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([{ farm_id }]),
        roleId: 3,
      });
      const editAbout = { about: faker.lorem.sentences() };
      const res = await patchRequest(marketDirectoryInfoId, editAbout, {
        farm_id,
        user_id,
      });
      expect(res.status).toBe(403);
    });

    test('Should return 404 not found if market directory info is deleted', async () => {
      await knex('market_directory_info')
        .update({ deleted: true })
        .where({ id: marketDirectoryInfoId });
      const res = await patchRequest(marketDirectoryInfoId, marketDirectoryInfo, userFarmIds);
      expect(res.status).toBe(404);
    });

    describe('Adding and removing shared directory partners', () => {
      let partner1: MarketDirectoryPartner;
      let partner2: MarketDirectoryPartner;

      const patchDirectoryInfo = (data: MarketDirectoryInfoReqBody) =>
        patchRequest(marketDirectoryInfoId, data, userFarmIds);

      beforeEach(async () => {
        [partner1] = await mocks.market_directory_partnerFactory();
        [partner2] = await mocks.market_directory_partnerFactory();
      });

      test('Should only allow adding existing partners', async () => {
        const NON_EXISTENT_PARTNER_ID = 1001;

        const patchReqBody = {
          partner_permissions: [{ market_directory_partner_id: NON_EXISTENT_PARTNER_ID }],
        };
        const res = await patchDirectoryInfo(patchReqBody);

        expect(res.status).toBe(400);
        expect(res.text).toBe(`One or more partner does not exist: ${NON_EXISTENT_PARTNER_ID}`);
      });

      test('Should add multiple shared partners', async () => {
        const patchReqBody = {
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        };

        const res = await patchDirectoryInfo(patchReqBody);

        expect(res.status).toBe(204);

        // Check database
        const permissions = await knex('market_directory_partner_permissions').where({
          market_directory_info_id: marketDirectoryInfoId,
        });

        expect(permissions).toHaveLength(2);

        expect(permissions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ market_directory_partner_id: partner1.id }),
            expect.objectContaining({ market_directory_partner_id: partner2.id }),
          ]),
        );
      });

      test('Should remove (soft delete) a shared partner', async () => {
        // Step 1: Add both partners
        const patchReqBody = {
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        };
        await patchDirectoryInfo(patchReqBody);

        // Step 2: PATCH again omitting partner1
        const patchReqBodyRemove = {
          partner_permissions: [{ market_directory_partner_id: partner2.id }],
        };
        const res = await patchDirectoryInfo(patchReqBodyRemove);

        expect(res.status).toBe(204);

        // Step 3: Verify partner1 has been soft deleted
        const permission = await knex('market_directory_partner_permissions')
          .where({
            market_directory_info_id: marketDirectoryInfoId,
            market_directory_partner_id: partner1.id,
          })
          .first();

        expect(permission).toBeDefined();
        expect(permission.deleted).toBe(true);
      });

      test('Should restore a previously removed partner', async () => {
        // Step 1: Add both partners
        const patchReqBody = {
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        };
        await patchDirectoryInfo(patchReqBody);

        // Step 2: Remove both partners by sending an empty array
        const patchReqBodyRemove = {
          partner_permissions: [],
        };
        await patchDirectoryInfo(patchReqBodyRemove);

        // Step 3: Verify both are soft-deleted
        const permissions = await knex('market_directory_partner_permissions')
          .where({ market_directory_info_id: marketDirectoryInfoId })
          .whereIn('market_directory_partner_id', [partner1.id, partner2.id]);

        expect(permissions).toHaveLength(2);
        permissions.forEach((record) => {
          expect(record.deleted).toBe(true);
        });

        // Step 4: Restore partner1 by sending a new PATCH request
        const patchReqBodyRestore = {
          partner_permissions: [{ market_directory_partner_id: partner1.id }],
        };
        const res = await patchDirectoryInfo(patchReqBodyRestore);

        expect(res.status).toBe(204);

        // Step 5: Verify partner1 is restored
        const permission = await knex('market_directory_partner_permissions')
          .where({
            market_directory_info_id: marketDirectoryInfoId,
            market_directory_partner_id: partner1.id,
          })
          .first();

        expect(permission).toBeDefined();
        expect(permission.deleted).toBe(false);
      });
    });

    describe('Sending webhook notifications to partners', () => {
      let partner1: MarketDirectoryPartner & { webhookUrl: string };
      let partner2: MarketDirectoryPartner & { webhookUrl: string };
      let partner3: MarketDirectoryPartner & { webhookUrl: string };

      async function createPartnerWithWebhook() {
        const [partner] = await mocks.market_directory_partnerFactory();
        const webhookUrl = `https://partner-${partner.id}.example.com/webhook`;

        await mocks.market_directory_partner_authFactory(
          { promisedPartner: Promise.resolve([partner]) },
          mocks.fakeMarketDirectoryPartnerAuth({
            webhook_endpoint: webhookUrl,
          }),
        );

        return { ...partner, webhookUrl };
      }

      const patchDirectoryInfo = (data: MarketDirectoryInfoReqBody) =>
        patchRequest(marketDirectoryInfoId, data, userFarmIds);

      beforeEach(async () => {
        jest.clearAllMocks();

        partner1 = await createPartnerWithWebhook();
        partner2 = await createPartnerWithWebhook();
        partner3 = await createPartnerWithWebhook();
      });

      test('should notify new partners when permissions are added', async () => {
        const patchReqBody = {
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        };
        const res = await patchDirectoryInfo(patchReqBody);
        expect(res.status).toBe(204);

        // Wait for async webhook calls
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledTimes(2);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner1.webhookUrl);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner2.webhookUrl);
      });

      test('Should notify only changed partners when permissions are added or removed', async () => {
        // Add partner 1 and partner 2
        await patchDirectoryInfo({
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
        jest.clearAllMocks();

        // Remove partner1, keep partner2, add partner3
        const res = await patchDirectoryInfo({
          partner_permissions: [
            { market_directory_partner_id: partner2.id },
            { market_directory_partner_id: partner3.id },
          ],
        });

        expect(res.status).toBe(204);

        // Wait for async webhook calls
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should notify partner1 (removed) and partner3 (added), but NOT partner2
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledTimes(2);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner1.webhookUrl);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner3.webhookUrl);
        expect(mockedNotifyPartnerRefresh).not.toHaveBeenCalledWith(partner2.webhookUrl);
      });

      test('Should notify all current partners when directory info changes with no partner changes', async () => {
        // Add partner1 and partner2
        await patchDirectoryInfo({
          partner_permissions: [
            { market_directory_partner_id: partner1.id },
            { market_directory_partner_id: partner2.id },
          ],
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
        jest.clearAllMocks();

        // Update directory info without changing partners
        const res = await patchDirectoryInfo({
          farm_name: 'Updated Farm Name',
        });

        expect(res.status).toBe(204);

        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should notify both partner1 and partner2
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledTimes(2);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner1.webhookUrl);
        expect(mockedNotifyPartnerRefresh).toHaveBeenCalledWith(partner2.webhookUrl);
      });
    });

    describe('Should return 400 for invalid data', () => {
      test.each(invalidTestCases)('%s', async (property, data) => {
        const res = await patchRequest(
          marketDirectoryInfoId,
          { ...marketDirectoryInfo, [property]: data },
          userFarmIds,
        );

        expect(res.status).toBe(400);

        if (!res.error) {
          throw new Error('Expected an error'); // type guard
        }

        expect(res.error.text).toBe(`Invalid ${property}`);
      });
    });
  });
});
