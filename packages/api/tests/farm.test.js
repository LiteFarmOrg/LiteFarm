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

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment')
let {usersFactory, farmFactory, userFarmFactory} = require('./mock.factories');
let checkJwt;
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')

describe('Farm Tests', () => {
  let middleware;
  let newUser;
  beforeAll(() => {
    // beforeAll is set before each test
    // global.token is set in testEnvironment.js
    token = global.token;
  });

  afterAll((done) => {
    server.close(() =>{
      done();
    });
  })


  beforeEach(async () => {
    [newUser] = await usersFactory();
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = newUser.user_id;
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Valid and Invalid Inputs', () => {
    const blankFarm = {
      farm_name: '',
      address: '',
      grid_points: {},
      country: '',
    }

    const validFarm = {
      farm_name: 'Test Farm 1',
      address: '1210 Valid Street',
      grid_points: {
        lat: 22.33,
        lng: 122.33
      },
      country: 'United States',
    }

    test('should return 400 status if blank farm is posted', (done) => {
      postFarmRequest(blankFarm, (err, res) => {
        expect(res.status).toBe(400);
        done()
      })
    });

    test('should return 400 status if only farm name is filled', (done) => {
      postFarmRequest({ ...blankFarm, farm_name: 'Test Farm' }, (err, res) => {
        expect(res.status).toBe(400);
        done();
      })
    });

    test('should return 400 status if name and invalid address are filled', (done) => {
      postFarmRequest({
          ...blankFarm,
          farm_name: 'Test Farm',
          address: 'ANSOFANSOD',
          grid_points: { lat: 'sa', long: '212' },
          country: 'Canada',
        },
        (err, res) => {
          expect(res.status).toBe(400);
          done();
        })
    });

    test('should successfully create a farm if valid data is provided', (done) => {
      postFarmRequest(validFarm, (err, res) => {
        expect(res.status).toBe(201);
        const farm = res.body;
        expect(farm.units.currency).toBe('USD');
        expect(farm.units.measurement).toBe('imperial');
        done();
      })
    });

    test('should retrieve a recently created farm', (done) => {
      postFarmRequest(validFarm, (err, res) => {
        expect(res.status).toBe(201);
        const farmId = res.body.farm_id;
        getFarmRequest(farmId, (err, innerRes) => {
          expect(innerRes.status).toBe(200);
          const [receivedFarm] = innerRes.body;
          expect(receivedFarm.farm_id).toBe(farmId);
          done();
        })
      })
    })

    test('should retrieve a recently created farm with units and currency', (done) => {
      postFarmRequest({...validFarm, units: { measurement: 'imperial', currency: 'MXN'}  }, (err, res) => {
        expect(res.status).toBe(201);
        const farmId = res.body.farm_id;
        getFarmRequest(farmId, (err, innerRes) => {
          expect(innerRes.status).toBe(200);
          const [receivedFarm] = innerRes.body;
          expect(receivedFarm.farm_id).toBe(farmId);
          done();
        })
      });
    });

  });

  describe('Updating a Farm', () => {
    test('should fail to patch an address on a created farm', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      putFarmRequest({ farm_id: farm.farm_id, address: farm.address + '2222' },newUser.user_id, (err, res) => {
        expect(res.status).toBe(400);
        done();
      });
    });

    test('should succeed to change farm name', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      putFarmRequest({ farm_id: farm.farm_id, farm_name: 'OtherTestFarm' }, newUser.user_id, async (err,res) => {
        expect(res.status).toBe(200)
        const [receivedFarm] = res.body;
        expect(receivedFarm.farm_id).toBe(farm.farm_id);
        expect(receivedFarm.farm_name).toBe('OtherTestFarm');
        const [farmQuery] = await knex.select().from('farm').where({farm_id: farm.farm_id});
        expect(farmQuery.farm_name).toBe('OtherTestFarm');
        done();
      })
    })

    test('should fail to update a farm that I dont own or manage' , async (done) => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [user], promisedFarm: [farm]}, {role_id: 3, status: 'Active'});
      putFarmRequest({ farm_id: farm.farm_id, farm_name: 'OtherTestFarm' }, user.user_id, async (err,res) => {
        expect(res.status).toBe(403)
        done();
      })
    })
  });

  describe('Delete a Farm', () => {
    test('should succeed on deleting a farm that I own or manage', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      deleteRequest(farm, newUser.user_id, async (err,res) => {
        expect(res.status).toBe(200);
        const [farmQuery] = await knex.select().from('farm').where({farm_id: farm.farm_id});
        expect(farmQuery.deleted).toBe(true);
        done()
      });
    })

    test('should fail to delete a farm if I am not an owner or manager', async (done) => {
      const [user] = await usersFactory();
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [user], promisedFarm: [farm]}, {role_id: 3, status: 'Active'});
      deleteRequest(farm, user.user_id, async (err,res) => {
        expect(res.status).toBe(403);
        const farmQuery = await knex.select().from('farm').where({farm_id: farm.farm_id});
        expect(farmQuery.length).not.toBe(0);
        done()
      });
    })
  });

  describe('Ownership checks', () => {
    test('should fail to update a farm Im not a part of', async (done) => {
      const [farmImNotPartOf] = await userFarmFactory();
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      minimalPutFarmRequest( farmImNotPartOf.farm_id)
        .set('farm_id', farm.farm_id)
        .set('user_id', newUser.user_id)
        .send({ farm_id: farmImNotPartOf.farm_id, farm_name: 'OtherTestFarm' })
        .end((err, res) => {
          expect(res.status).toBe(403);
          done();
        })
    })

    test('should fail to delete a farm Im not a part of ', async (done) => {
      const [farmImNotPartOf] = await userFarmFactory();
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      minimalDeleteRequest( farmImNotPartOf.farm_id)
        .set('farm_id', farm.farm_id)
        .set('user_id', newUser.user_id)
        .end((err, res) => {
          expect(res.status).toBe(403);
          done();
        })
    });
  })
});


function postFarmRequest(data, callback) {
  chai.request(server).post('/farm')
    .set('Content-Type', 'application/json')
    .send(data)
    .end(callback)
}

function getFarmRequest(id, callback) {
  chai.request(server).get(`/farm/${id}`)
    .end(callback)
}

function putFarmRequest(data, user, callback) {
  chai.request(server).put(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user)
    .send(data)
    .end(callback)
}

function minimalPutFarmRequest(farmId) {
  return chai.request(server).put(`/farm/${farmId}`)
}

function deleteRequest(data, user, callback) {
  chai.request(server).delete(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user)
    .end(callback)
}

function minimalDeleteRequest(farmId){
  return chai.request(server).delete(`/farm/${farmId}`);
}
