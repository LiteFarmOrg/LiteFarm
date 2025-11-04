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
import MarketDirectoryInfoModel from '../src/models/marketDirectoryInfoModel.js';
import { SOCIAL_DOMAINS } from '../src/util/socials.js';
import { HeadersParams } from './types.js';

const marketDirectoryInfo = mocks.fakeMarketDirectoryInfo({
  logo: faker.internet.url(),
  about: faker.lorem.sentences(),
  contact_last_name: faker.name.lastName(),
  email: faker.internet.email(),
  country_code: Math.floor(Math.random() * 999) + 1,
  phone_number: faker.phone.phoneNumber(),
  website: faker.internet.url(),
  instagram: 'username',
  facebook: 'username',
  x: 'username',
});

const fakeInvalidString = (input: string = '') => `${input}${INVALID_SUFFIX}`;

const invalidTestCases = [
  ['address', fakeInvalidString(faker.address.streetAddress())],
  ['website', fakeInvalidString(faker.internet.url())],
  ['contact_email', faker.lorem.word()],
  ['email', faker.lorem.word()],
  ['instagram', SOCIAL_DOMAINS['instagram']], // domain without username
  ['facebook', `/${faker.internet.userName()}`], // username with invalid character
  ['x', `https://${SOCIAL_DOMAINS['x']}/username!}`], // url with invalid username
];

async function postRequest(data: MarketDirectoryInfoReqBody, { user_id, farm_id }: HeadersParams) {
  return chai
    .request(server)
    .post('/market_directory_info')
    .set('content-type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

describe('Market Directory Info Tests', () => {
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Post Market Directory Info', () => {
    test('Admin users should be able to create a market directory info', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await postRequest(marketDirectoryInfo, userFarmIds);

        expect(res.status).toBe(201);

        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const record = await MarketDirectoryInfoModel.query()
          .where('farm_id', userFarmIds.farm_id)
          .first();

        for (const property in marketDirectoryInfo) {
          const key = property as keyof typeof marketDirectoryInfo;
          expect(record[key]).toBe(marketDirectoryInfo[key]);
        }
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
});
