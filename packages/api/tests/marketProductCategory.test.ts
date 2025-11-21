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
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { returnUserFarms } from './utils/testDataSetup.js';
import { HeadersParams } from './types.js';

async function getRequest({ user_id, farm_id }: HeadersParams) {
  return chai
    .request(server)
    .get('/market_product_categories')
    .set('content-type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

describe('Market Product Category Tests', () => {
  async function makeProductCategory() {
    const [productCategory] = await mocks.market_product_categoryFactory();
    return productCategory;
  }
  beforeAll(async () => {
    await Promise.all([1, 2, 3].map(async () => await makeProductCategory()));
  });
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET Market Product Categories', () => {
    test('All users should get market product categories', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);

        const res = await getRequest({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
      }
    });
  });
});
