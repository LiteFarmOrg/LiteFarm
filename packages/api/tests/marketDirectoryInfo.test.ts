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
  FarmMarketProductCategory,
  MarketDirectoryInfo,
  MarketDirectoryInfoWithRelations,
  MarketProductCategory,
} from '../src/models/types.js';

const fakeMarketDirectoryInfo = mocks.fakeMarketDirectoryInfo({
  logo: faker.internet.url(),
  about: faker.lorem.sentences(),
  contact_last_name: faker.name.lastName(),
  email: faker.internet.email(),
  country_code: Math.floor(Math.random() * 999) + 1,
  phone_number: faker.phone.phoneNumber(),
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
  farm_market_product_categories?: WithoutKeysInArray<
    FarmMarketProductCategory[],
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
    farm_market_product_categories: marketProductCategories.map((marketProductCategory) => ({
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
  ['farm_market_product_categories', null],
  ['farm_market_product_categories', []],
];

// This helps with object comparison
const addMarketIdToRelation = <T>(fakeData: T, id?: MarketDirectoryInfo['id']) => {
  let fakeDataWithIds = [];
  if (Array.isArray(fakeData)) {
    fakeDataWithIds = fakeData.map((fakeDatum) => ({ ...fakeDatum, market_directory_info_id: id }));
  }
  return fakeDataWithIds;
};

const expectMarketDirectoryInfo = (
  expectedData: MarketDirectoryInfoWithRelations,
  fakeData: CompleteMarketDirectoryInfoReq,
) => {
  for (const property in fakeData) {
    const key = property as keyof typeof fakeData;
    if (Array.isArray(fakeData[key])) {
      const adjustedFakeData = addMarketIdToRelation(fakeData[key], expectedData.id);
      expect(expectedData[key]).toMatchObject(adjustedFakeData);
    } else {
      expect(expectedData[key]).toBe(fakeData[key]);
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
  const { farm_market_product_categories, ...filteredMarketDirectoryInfo } = marketDirectoryInfo;
  const [directoryInfo] = await mocks.market_directory_infoFactory({
    promisedUserFarm: Promise.resolve([userFarmIds]),
    marketDirectoryInfo: filteredMarketDirectoryInfo,
  });
  const farmMarketProductCategories =
    farm_market_product_categories?.map((category) => ({
      id: category.market_product_category_id,
    })) || [];
  for (const category of farmMarketProductCategories) {
    await mocks.farm_market_product_categoryFactory({
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
      const res = await postRequest(marketDirectoryInfo, { farm_id, user_id });
      expect(res.status).toBe(403);
    });

    test('Should get null when there is no market directory info', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const res = await getRequest(userFarmIds);
      expect(res.status).toBe(200);
      expect(res.body).toBe(null);
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
      const editAbout = { about: 'About is edited' };

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
      const editAbout = { about: 'About is edited' };
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
