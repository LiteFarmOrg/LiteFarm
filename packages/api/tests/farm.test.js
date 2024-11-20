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
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mockFactories from './mock.factories.js';
const { usersFactory, farmFactory, userFarmFactory } = mockFactories;
import farmModel from '../src/models/farmModel.js';
import mocks from './mock.factories.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

describe('Farm Tests', () => {
  let token;
  let newUser;
  beforeAll(() => {
    // beforeAll is set before each test
    // global.token is set in testEnvironment.js
    token = global.token;
  });

  beforeEach(async () => {
    [newUser] = await usersFactory();
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('FarmModel test', () => {
    test('should fail to patch an address on a created farm', async () => {
      const [farm] = await farmFactory();
      const filteredFarm = await farmModel.query().findById(farm.farm_id);

      expect(filteredFarm.sandbox_farm).toBeUndefined();
    });
  });

  describe('Valid and Invalid Inputs', () => {
    const blankFarm = {
      farm_name: '',
      address: '',
      grid_points: {},
      country: '',
    };

    const validFarm = {
      farm_name: 'Test Farm 1',
      address: '1210 Valid Street',
      grid_points: {
        lat: 22.33,
        lng: 122.33,
      },
      country: 'US',
    };

    test('should return 400 status if blank farm is posted', async () => {
      const res = await postFarmRequest(blankFarm, newUser.user_id);
      expect(res.status).toBe(400);
    });

    test('should return 400 status if only farm name is filled', async () => {
      const res = await postFarmRequest({ ...blankFarm, farm_name: 'Test Farm' }, newUser.user_id);
      newUser.user_id;
      expect(res.status).toBe(400);
    });

    test('should return 400 status if name and invalid address are filled', async () => {
      const res = await postFarmRequest(
        {
          ...blankFarm,
          farm_name: 'Test Farm',
          address: 'ANSOFANSOD',
          grid_points: { lat: 'sa', long: '212' },
          country: 'CA',
        },
        newUser.user_id,
      );

      expect(res.status).toBe(400);
    });

    test('should successfully create a farm if valid data is provided', async () => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [user], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );

      {
        const res = await postFarmRequest(validFarm, user.user_id);
        expect(res.status).toBe(201);
        const farm = res.body;
        expect(farm.units.currency).toBe('USD');
        expect(farm.units.measurement).toBe('imperial');
      }
    });

    test('should retrieve a recently created farm', async () => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [user], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const res = await postFarmRequest(validFarm, user.user_id);
      expect(res.status).toBe(201);
      const farmId = res.body.farm_id;
      const innerRes = await getFarmRequest(farmId, user.user_id);
      expect(innerRes.status).toBe(200);
      const [receivedFarm] = innerRes.body;
      expect(receivedFarm.farm_id).toBe(farmId);
    });

    test('should retrieve a recently created farm with units and currency', async () => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [user], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );

      const res = await postFarmRequest(
        { ...validFarm, units: { measurement: 'imperial', currency: 'MXN' } },
        user.user_id,
      );

      expect(res.status).toBe(201);
      const farmId = res.body.farm_id;
      const innerRes = await getFarmRequest(farmId, user.user_id);
      expect(innerRes.status).toBe(200);
      const [receivedFarm] = innerRes.body;
      expect(receivedFarm.farm_id).toBe(farmId);
    });
  });

  describe('Updating a Farm', () => {
    test('should fail to patch an address on a created farm', async () => {
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const res = await putFarmRequest(
        { farm_id: farm.farm_id, address: farm.address + '2222' },
        newUser.user_id,
      );
      expect(res.status).toBe(400);
    });

    test('should succeed to change farm name', async () => {
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const res = await putFarmRequest(
        { farm_id: farm.farm_id, farm_name: 'OtherTestFarm' },
        newUser.user_id,
      );
      expect(res.status).toBe(200);
      const [receivedFarm] = res.body;
      expect(receivedFarm.farm_id).toBe(farm.farm_id);
      expect(receivedFarm.farm_name).toBe('OtherTestFarm');
      const [farmQuery] = await knex.select().from('farm').where({ farm_id: farm.farm_id });
      expect(farmQuery.farm_name).toBe('OtherTestFarm');
    });

    test('should fail to update a farm that I dont own or manage', async () => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [user], promisedFarm: [farm] },
        { role_id: 3, status: 'Active' },
      );
      const res = await putFarmRequest(
        { farm_id: farm.farm_id, farm_name: 'OtherTestFarm' },
        user.user_id,
      );
      expect(res.status).toBe(403);
    });
  });

  describe('Delete a Farm', () => {
    test('should succeed on deleting a farm that I own or manage', async () => {
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const res = await deleteRequest(farm, newUser.user_id);
      expect(res.status).toBe(200);
      const [farmQuery] = await knex.select().from('farm').where({ farm_id: farm.farm_id });
      expect(farmQuery.deleted).toBe(true);
    });

    test('should fail to delete a farm if I am not an owner or manager', async () => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [user], promisedFarm: [farm] },
        { role_id: 3, status: 'Active' },
      );
      const res = await deleteRequest(farm, user.user_id);
      expect(res.status).toBe(403);
      const farmQuery = await knex.select().from('farm').where({ farm_id: farm.farm_id });
      expect(farmQuery.length).not.toBe(0);
    });
  });

  describe('Ownership checks', () => {
    test('should fail to update a farm Im not a part of', async () => {
      const [farmImNotPartOf] = await userFarmFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      minimalPutFarmRequest(farmImNotPartOf.farm_id)
        .set('farm_id', farm.farm_id)
        .set('user_id', newUser.user_id)
        .send({ farm_id: farmImNotPartOf.farm_id, farm_name: 'OtherTestFarm' })
        .end((err, res) => {
          expect(res.status).toBe(403);
        });
    });

    test('should fail to delete a farm Im not a part of ', async () => {
      const [farmImNotPartOf] = await userFarmFactory();
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      minimalDeleteRequest(farmImNotPartOf.farm_id)
        .set('farm_id', farm.farm_id)
        .set('user_id', newUser.user_id)
        .end((err, res) => {
          expect(res.status).toBe(403);
        });
    });
  });
  describe('Patch default location test', () => {
    test('should patch default_initial_location_id', async () => {
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const [field] = await mocks.fieldFactory({ promisedFarm: [farm] });

      const res = await patchDefaultLocationRequest(
        farm.farm_id,
        { default_initial_location_id: field.location_id },
        newUser.user_id,
      );

      expect(res.status).toBe(200);
      expect(res.body.default_initial_location_id).toBe(field.location_id);
    });
    test('should fail to update default_initial_location_id when the location is not part of the farm', async () => {
      const [farm] = await farmFactory();
      await userFarmFactory(
        { promisedUser: [newUser], promisedFarm: [farm] },
        { role_id: 1, status: 'Active' },
      );
      const [field] = await mocks.fieldFactory();

      const res = await patchDefaultLocationRequest(
        farm.farm_id,
        { default_initial_location_id: field.location_id },
        newUser.user_id,
      );

      expect(res.status).toBe(403);
    });
  });
});

function postFarmRequest(data, user) {
  return chai
    .request(server)
    .post('/farm')
    .set('Content-Type', 'application/json')
    .set('user_id', user ?? '')
    .send(data);
}

function getFarmRequest(id, user) {
  return chai.request(server).get(`/farm/${id}`).set('user_id', user);
}

function putFarmRequest(data, user) {
  return chai
    .request(server)
    .put(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user)
    .send(data);
}

function minimalPutFarmRequest(farmId) {
  return chai.request(server).put(`/farm/${farmId}`);
}

function deleteRequest(data, user) {
  return chai
    .request(server)
    .delete(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user);
}

function minimalDeleteRequest(farmId) {
  return chai.request(server).delete(`/farm/${farmId}`);
}

function patchDefaultLocationRequest(farm_id, data, user) {
  return chai
    .request(server)
    .patch(`/farm/${farm_id}/default_initial_location`)
    .set('Content-Type', 'application/json')
    .set('farm_id', farm_id)
    .set('user_id', user)
    .send(data);
}
