/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
import moment from 'moment';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/jobs/station_sync/mapping.js');
import mocks from './mock.factories.js';
import priceModel from '../src/models/priceModel';

describe('Price Tests', () => {
  let token;
  let farm;
  let newOwner;
  let crop;

  beforeAll(() => {
    token = global.token;
  });

  function postPriceRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .post('/price')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function putPriceRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { price_id } = data;

    return chai
      .request(server)
      .put(`/price/${price_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data);
  }

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    return chai
      .request(server)
      .get(`/price/farm/${farm_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function deleteRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id }) {
    const { price_id } = data;

    return chai
      .request(server)
      .delete(`/price/${price_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function returnUserFarms(role) {
    const [mainFarm] = await mocks.farmFactory();
    const [user] = await mocks.usersFactory();
    const [userFarm] = await mocks.userFarmFactory(
      {
        promisedUser: [user],
        promisedFarm: [mainFarm],
      },
      fakeUserFarm(role),
    );
    return { mainFarm, user };
  }

  function getFakePrice(crop_id, farm_id) {
    const price = mocks.fakePrice();
    return { ...price, crop_id, farm_id };
  }

  async function returnPrice(mainFarm) {
    const [crop] = await mocks.cropFactory({ promisedFarm: [mainFarm] });
    const [price] = await mocks.priceFactory({ promisedCrop: [crop] });
    return { price };
  }

  async function returnCrop(mainFarm) {
    const [crop] = await mocks.cropFactory({ promisedFarm: [mainFarm] });
    return { crop };
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
    [crop] = await mocks.cropFactory({ promisedFarm: [farm] });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  // POST TESTS

  describe('Post price tests', () => {
    test('Owner should post price', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { crop } = await returnCrop(mainFarm);
      const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

      const res = await postPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(201);
      const prices = await priceModel.query().where('farm_id', mainFarm.farm_id);
      expect(prices.length).toBe(1);
      expect(prices[0].price_id).toBe(price.price_id);
    });

    test('Manager should post price', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { crop } = await returnCrop(mainFarm);
      const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

      const res = await postPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(201);
      const prices = await priceModel.query().where('farm_id', mainFarm.farm_id);
      expect(prices.length).toBe(1);
      expect(prices[0].price_id).toBe(price.price_id);
    });

    test('Should return 403 when worker tries to post price', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { crop } = await returnCrop(mainFarm);
      const price = getFakePrice(crop.crop_id, mainFarm.farm_id);

      const res = await postPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): add:prices');
    });

    test('Should return 403 when unauthorized user tries to post price', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await postPriceRequest(price, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): add:prices');
    });
  });

  // PUT TESTS

  describe('Put price tests', () => {
    test('Owner should update value_$/kg', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);

      price['value_$/kg'] = 8;
      const res = await putPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0]['value_$/kg']).toBe(8);
    });

    test('Manager should update value_$/kg', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { price } = await returnPrice(mainFarm);

      price['value_$/kg'] = 22;
      const res = await putPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(200);
      expect(res.body[0]['value_$/kg']).toBe(22);
    });

    test('Should return 403 when a worker tries to edit value_$/kg', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { price } = await returnPrice(mainFarm);

      price['value_$/kg'] = 100;
      const res = await putPriceRequest(price, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): edit:prices');
    });

    test('Should return 403 when a unauthorized user tries to edit value_$/kg', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      price['quantity_kg/m2'] = 4;
      const res = await putPriceRequest(price, { user_id: unAuthorizedUser.user_id });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('user not authorized to access farm');
    });
  });

  // GET TESTS

  describe('Get price tests', () => {
    test('Owner should get price by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(price.farm_id);
    });

    test('Manager should get price by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { price } = await returnPrice(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(price.farm_id);
    });

    test('Worker should get price by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { price } = await returnPrice(mainFarm);

      const res = await getRequest({ user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      expect(res.body[0].farm_id).toBe(price.farm_id);
    });

    test('Should get status 403 if an unauthorizedUser tries to get price by farm id', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [unAuthorizedUser] = await mocks.usersFactory();
      const res = await getRequest({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): get:prices');
    });
  });

  // DELETE TESTS

  describe('Delete price tests', () => {
    test('Owner should delete their price', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);

      const res = await deleteRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      const [deletedPrice] = await priceModel.query().where('price_id', price.price_id);
      expect(deletedPrice.deleted).toBe(true);
    });

    test('Manager should delete their price', async () => {
      const { mainFarm, user } = await returnUserFarms(2);
      const { price } = await returnPrice(mainFarm);

      const res = await deleteRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(200);
      const [deletedPrice] = await priceModel.query().where('price_id', price.price_id);
      expect(deletedPrice.deleted).toBe(true);
    });

    test('Should return 403 if a worker tries to delete a price', async () => {
      const { mainFarm, user } = await returnUserFarms(3);
      const { price } = await returnPrice(mainFarm);

      const res = await deleteRequest(price, { user_id: user.user_id, farm_id: mainFarm.farm_id });
      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): delete:prices');
    });

    test('Should get status 403 if an unauthorizedUser tries to delete price', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { price } = await returnPrice(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await deleteRequest(price, {
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): delete:prices');
    });
  });
});
