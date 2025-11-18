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

import { Response } from 'superagent';
import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import { HeadersParams } from './types.js';
import { Farm, User } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

interface Partner {
  id: number;
  key: string;
}

async function getRequest(
  { user_id, farm_id }: HeadersParams,
  query = '',
): Promise<Omit<Response, 'body'> & { body: Partner[] }> {
  return chai
    .request(server)
    .get(`/market_directory_partner${query}`)
    .set('content-type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

const getReqWithFilter = async (farmId: Farm['farm_id'], userId: User['user_id']) => {
  return getRequest({ farm_id: farmId, user_id: userId }, '?filter=country');
};

const expectSuccessResponse = (
  res: Omit<Response, 'body'> & { body: Partner[] },
  expectedPartners: Partner[],
) => {
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(expectedPartners.length);
  expect(res.body.map(({ id }) => id).sort()).toEqual(expectedPartners.map(({ id }) => id).sort());
};

describe('GET Market Directory Partner Tests', () => {
  let user: User;
  let canada;
  let us;
  let france;
  let canadaFarm: Farm;
  let usFarm: Farm;
  let franceFarm: Farm;
  let farmWithoutCountryId: Farm;
  let partner1: Partner;
  let partner2: Partner;
  // Partner with no record in market_directory_partner_country.
  // Should not be included in the API response.
  let _partnerWithoutCountryRecord: Partner;

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  beforeAll(async () => {
    [canada, us, france] = await Promise.all(
      ['Canada', 'United States', 'France'].map((name) =>
        knex('countries').where({ country_name: name }).first(),
      ),
    );
    [[canadaFarm], [usFarm], [franceFarm]] = await Promise.all(
      [canada, us, france].map(({ id }) =>
        // @ts-expect-error no country_id in farmFactory
        mocks.farmFactory({ ...mocks.fakeFarm(), country_id: id }),
      ),
    );
    [farmWithoutCountryId] = await mocks.farmFactory();
    [[partner1], [partner2], [_partnerWithoutCountryRecord]] = await Promise.all(
      new Array(3).fill('').map(() => mocks.market_directory_partnerFactory()),
    );

    // Associate partner1 with canada and us
    await Promise.all(
      [canada, us].map((country) =>
        mocks.market_directory_partner_countryFactory({
          promisedPartner: Promise.resolve([partner1]),
          promisedCountry: Promise.resolve([country]),
        }),
      ),
    );

    // Associate partner2 with canada
    await mocks.market_directory_partner_countryFactory({
      promisedPartner: Promise.resolve([partner2]),
      promisedCountry: Promise.resolve([canada]),
    });

    [user] = await mocks.usersFactory();

    // Add the user to all farms
    await Promise.all(
      [canadaFarm, usFarm, franceFarm, farmWithoutCountryId].map((farm) => {
        mocks.userFarmFactory({
          promisedFarm: Promise.resolve([farm]),
          promisedUser: Promise.resolve([user]),
          roleId: 1,
        });
      }),
    );
  });

  test('Admin users should be able to get market directory partners', async () => {
    const adminRoles = [1, 2, 5];

    for (const role of adminRoles) {
      const [{ user_id }] = await mocks.userFarmFactory({
        promisedFarm: Promise.resolve([canadaFarm]),
        roleId: role,
      });

      const res = await getRequest({ farm_id: canadaFarm.farm_id, user_id });
      expectSuccessResponse(res, [partner1, partner2]);
    }
  });

  test('Worker should not be able to get market directory partners', async () => {
    const [{ user_id }] = await mocks.userFarmFactory({
      promisedFarm: Promise.resolve([canadaFarm]),
      roleId: 3,
    });
    const res = await getRequest({ farm_id: canadaFarm.farm_id, user_id });
    expect(res.status).toBe(403);
  });

  describe('Tests with global partners', () => {
    let globalPartner1: Partner;
    let globalPartner2: Partner;

    beforeAll(async () => {
      [[globalPartner1], [globalPartner2]] = await Promise.all(
        new Array(2).fill('').map(() => mocks.market_directory_partnerFactory()),
      );

      // Associate global partners with all countries
      await Promise.all(
        [globalPartner1, globalPartner2].map((partner) =>
          mocks.market_directory_partner_countryFactory({
            promisedPartner: Promise.resolve([partner]),
            promisedCountry: Promise.resolve([null]),
          }),
        ),
      );
    });

    afterAll(async () => {
      await knex('market_directory_partner_country')
        .del()
        .whereIn('market_directory_partner_id', [globalPartner1.id, globalPartner2.id]);
    });

    test('Should get all partners without the country filter', async () => {
      const allPartners = [partner1, partner2, globalPartner1, globalPartner2];

      const canadaFarmRes = await getRequest({
        farm_id: canadaFarm.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(canadaFarmRes, allPartners);

      const usFarmRes = await getRequest({ farm_id: usFarm.farm_id, user_id: user.user_id });
      expectSuccessResponse(usFarmRes, allPartners);

      const franceFarmRes = await getRequest({
        farm_id: franceFarm.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(franceFarmRes, allPartners);

      const farmWithoutCountryIdRes = await getRequest({
        farm_id: farmWithoutCountryId.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(farmWithoutCountryIdRes, allPartners);
    });

    test('Should get relevant partners with the country filter', async () => {
      const canadaFarmRes = await getReqWithFilter(canadaFarm.farm_id, user.user_id);
      expectSuccessResponse(canadaFarmRes, [partner1, partner2, globalPartner1, globalPartner2]);

      const usFarmRes = await getReqWithFilter(usFarm.farm_id, user.user_id);
      expectSuccessResponse(usFarmRes, [partner1, globalPartner1, globalPartner2]);

      const franceFarmRes = await getReqWithFilter(franceFarm.farm_id, user.user_id);
      expectSuccessResponse(franceFarmRes, [globalPartner1, globalPartner2]);
    });

    test('Should return global partners when the farm has no country_id', async () => {
      const res = await getReqWithFilter(farmWithoutCountryId.farm_id, user.user_id);
      expectSuccessResponse(res, [globalPartner1, globalPartner2]);
    });
  });

  describe('Tests without global partners', () => {
    test('Should get all partners without the country filter', async () => {
      const allPartners = [partner1, partner2];

      const canadaFarmRes = await getRequest({
        farm_id: canadaFarm.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(canadaFarmRes, allPartners);

      const usFarmRes = await getRequest({ farm_id: usFarm.farm_id, user_id: user.user_id });
      expectSuccessResponse(usFarmRes, allPartners);

      const franceFarmRes = await getRequest({
        farm_id: franceFarm.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(franceFarmRes, allPartners);

      const farmWithoutCountryIdRes = await getRequest({
        farm_id: farmWithoutCountryId.farm_id,
        user_id: user.user_id,
      });
      expectSuccessResponse(farmWithoutCountryIdRes, allPartners);
    });

    test('Should get relevant partners with the country filter', async () => {
      const canadaFarmRes = await getReqWithFilter(canadaFarm.farm_id, user.user_id);
      expectSuccessResponse(canadaFarmRes, [partner1, partner2]);

      const usFarmRes = await getReqWithFilter(usFarm.farm_id, user.user_id);
      expectSuccessResponse(usFarmRes, [partner1]);
    });

    test('Should return an empty array when there is no partner in the country', async () => {
      const res = await getReqWithFilter(franceFarm.farm_id, user.user_id);
      expectSuccessResponse(res, []);
    });

    test('Should return an empty array when the farm has no country_id', async () => {
      const res = await getReqWithFilter(farmWithoutCountryId.farm_id, user.user_id);
      expectSuccessResponse(res, []);
    });
  });
});
