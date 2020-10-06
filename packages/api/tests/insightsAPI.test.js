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
const knex = require('../src/util/knex');
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

  afterAll((done) => {
    server.close(() =>{
      done();
    });
  })

  describe('People Fed', () => {
    test('Should get people fed if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get people fed if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'people_fed', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

      test('Should get people fed if Im on my farm as a worker',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'people_fed', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
  });

  describe('Soil Om', () => {
    test('Should get soil om if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get soil om if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get soil om if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'soil_om', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('labour happiness', () => {
    test('Should get labour happiness if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get labour happiness if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get labour happiness if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'labour_happiness', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('biodiversity', () => {
    test('Should get biodiversity if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get biodiversity if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get biodiversity if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'biodiversity', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  xdescribe('prices distance', () => {
    test('Should get prices distance if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get prices distance if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get prices distance if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'prices/distance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  });

  describe('waterbalance', () => {
    describe('GET', () => {
      test('Should get waterbalance if Im on my farm as an owner',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
      test('Should get waterbalance if Im on my farm as a manager',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      })

      test('Should get waterbalance if Im on my farm as a worker',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'waterbalance', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    })

    describe('POST', () => {
      test('should create a water balance if Im on my farm as an owner' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const [field] = await  mocks.fieldFactory({promisedFarm: [{farm_id}]});
        const [{ crop_id, field_id }] = await mocks.fieldCropFactory({promisedField: [field]});
        const waterBalance = {...mocks.fakeWaterBalance(), crop_id, field_id}
        postWaterBalance(waterBalance, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(201);
          done();
        })
      });

      test('should create a water balance if Im on my farm as a manager' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const [field] = await  mocks.fieldFactory({promisedFarm: [{farm_id}]});
        const [{ crop_id, field_id }] = await mocks.fieldCropFactory({promisedField: [field]});
        const waterBalance = {...mocks.fakeWaterBalance(), crop_id, field_id}
        postWaterBalance(waterBalance, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(201);
          done();
        })
      });

      test('should fail to create  a water balance if Im on my farm as a Worker' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const [field] = await  mocks.fieldFactory({promisedFarm: [{farm_id}]});
        const [{ crop_id, field_id }] = await mocks.fieldCropFactory({promisedField: [field]});
        const waterBalance = {...mocks.fakeWaterBalance(), crop_id, field_id}
        postWaterBalance(waterBalance, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });


    })
  });

  describe('waterbalance schedule', () => {
    describe('GET', () => {
      test('Should get waterbalance schedule if Im on my farm as an owner',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
      test('Should get waterbalance schedule if Im on my farm as a manager',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      })
      test('Should get waterbalance schedule if Im on my farm as a worker',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'waterbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });
    describe('POST', () => {
      test('Should register my farm to the water balance schedule as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        postWaterBalanceSchedule({farm_id, user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          const schedule = await knex('waterBalanceSchedule').where({farm_id}).first();
          expect(schedule.farm_id).toBe(farm_id);
          done();
        })
      })
      test('Should register my farm to the water balance schedule as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        postWaterBalanceSchedule({farm_id, user_id}, async (err, res) => {
          expect(res.status).toBe(200);
          const schedule = await knex('waterBalanceSchedule').where({farm_id}).first();
          expect(schedule.farm_id).toBe(farm_id);
          done();
        })
      })

      test('Should fail to register my farm to the water balance schedule as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        postWaterBalanceSchedule({farm_id, user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      })

    })
  });

  describe('nitrogenbalance', () => {
    test('Should get nitrogenbalance if Im on my farm as an owner',async  (done) => {
      const [{user_id, farm_id}] = await createUserFarm(1)
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
    test('Should get nitrogenbalance if Im on my farm as a manager',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(2);
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    })

    test('Should get nitrogenbalance if Im on my farm as a worker',async  (done) => {
      const [{ user_id, farm_id }] = await createUserFarm(3);
      getInsight(farm_id, user_id, 'nitrogenbalance', (err, res) => {
        expect(res.status).toBe(200);
        done();
      });
    });
  })

  describe('nitrogenbalance schedule', () => {
    describe('GET' , () => {
      test('Should get nitrogenbalance schedule if Im on my farm as an owner',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });

      test('Should get nitrogenbalance schedule if Im on my farm as a manager',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      })

      test('Should get nitrogenbalance schedule if Im on my farm as a worker',async  (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        getInsight(farm_id, user_id, 'nitrogenbalance/schedule', (err, res) => {
          expect(res.status).toBe(200);
          done();
        });
      });
    });

    describe('POST', () => {
      test('should create nitrogen balance schedule if Im on my farm as an owner' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const nitrogenSchedule = {...mocks.fakeNitrogenSchedule(), farm_id};
        postNitrogenSchedule(nitrogenSchedule, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(201);
          done();
        })
      });

      test('should createnitrogen balance if Im on my farm as a manager' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const nitrogenSchedule = {...mocks.fakeNitrogenSchedule(), farm_id};
        postNitrogenSchedule(nitrogenSchedule, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(201);
          done();
        })
      });

      test('should fail to create nitrogen balance if Im on my farm as a Worker' , async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const nitrogenSchedule = {...mocks.fakeNitrogenSchedule(), farm_id};
        postNitrogenSchedule(nitrogenSchedule, {farm_id, user_id}, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });


    })

    describe('DELETE', () => {
      test('should delete nitrogen balance schedule if Im on my farm as an owner', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(1);
        const [schedule] = await mocks.nitrogenScheduleFactory({promisedFarm: [{ farm_id }]});
        deleteNitrogenSchedule({user_id, farm_id}, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(200);
          done()
        });
      });

      test('should delete nitrogen balance schedule if Im on my farm as a manager', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(2);
        const [schedule] = await mocks.nitrogenScheduleFactory({promisedFarm: [{ farm_id }]});
        deleteNitrogenSchedule({user_id, farm_id}, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(200);
          done()
        });
      })

      test('should fail to delete nitrogen balance schedule if Im on my farm as a worker', async (done) => {
        const [{ user_id, farm_id }] = await createUserFarm(3);
        const [schedule] = await mocks.nitrogenScheduleFactory({promisedFarm: [{ farm_id }]});
        deleteNitrogenSchedule({user_id, farm_id}, schedule.nitrogen_schedule_id, (err, res) => {
          expect(res.status).toBe(403);
          done()
        });
      })
    });
  })

});

function createUserFarm(role) {
  return  mocks.userFarmFactory({
    promisedFarm: mocks.farmFactory(),
    promisedUser: mocks.usersFactory()
  }, {role_id: role, status: 'Active'});
}

function getInsight(farmId, userId, route, callback) {
    chai.request(server).get(`/insight/${route}/${farmId}`)
      .set('farm_id', farmId)
      .set('user_id', userId)
      .end(callback)
  }

function postWaterBalance(data, { farm_id, user_id }, callback) {
  chai.request(server).post(`/insight/waterbalance`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send(data)
    .end(callback)
}
function postNitrogenSchedule(data, {farm_id, user_id} , callback) {
  chai.request(server).post('/insight/nitrogenbalance/schedule')
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send(data)
    .end(callback)
}

function postWaterBalanceSchedule({farm_id, user_id}, callback) {
  chai.request(server).post(`/insight/waterbalance/schedule`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .send({ farm_id })
    .end(callback)
}

function deleteNitrogenSchedule({farm_id, user_id}, nitrogenId, callback){
  chai.request(server).delete(`/insight/nitrogenbalance/schedule/${nitrogenId}`)
    .set('farm_id', farm_id)
    .set('user_id', user_id)
    .end(callback)
}
