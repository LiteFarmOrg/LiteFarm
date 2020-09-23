/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightsAPI.test.js) is part of LiteFarm.
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
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const server = require('./../src/server');
const mocks = require('./mock.factories');
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')


describe('insights test', () => {
  let middleware;
  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      next()
    });
  })
  describe('People Fed', () => {
    test('Should get people fed endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get people fed endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

      test('Should get people fed endpoint if Im on my farm as a worker',async  (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({
            promisedFarm: mocks.farmFactory(),
            promisedUser: mocks.usersFactory()
          },
          { role_id: 3, status: 'Active' });
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
  });

  describe('Soil Om', () => {
    test('Should get soil om endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get soil om endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get soil om endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('labour happiness', () => {
    test('Should get labour happiness endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get labour happiness endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get labour happiness endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('biodiversity', () => {
    test('Should get biodiversity endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get biodiversity endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get biodiversity endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('prices distance', () => {
    test('Should get prices distance endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get prices distance endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get prices distance endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('waterbalance', () => {
    test('Should get waterbalance endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get waterbalance endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get waterbalance endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('waterbalance schedule', () => {
    test('Should get waterbalance schedule endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get waterbalance schedule endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get waterbalance schedule endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('nitrogenbalance', () => {
    test('Should get nitrogenbalance endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get nitrogenbalance endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get nitrogenbalance endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  })

  describe('nitrogenbalance schedule', () => {
    test('Should get nitrogenbalance schedule endpoint if Im on my farm as an owner',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 1, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get nitrogenbalance schedule endpoint if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 2, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get nitrogenbalance schedule endpoint if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({
          promisedFarm: mocks.farmFactory(),
          promisedUser: mocks.usersFactory()
        },
        { role_id: 3, status: 'Active' });
      getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  })

});

  function getInsight(farmId, userId, route, callback) {
    chai.request(server).get(`/insight/${route}/${farmId}`)
      .set('farm_id', farmId)
      .set('user_id', userId)
      .end(callback)
  }
