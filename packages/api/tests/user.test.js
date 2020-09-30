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
const moment = require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline' : 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');

const userModel = require('../src/models/userModel');

describe('User Tests', () => {
  let middleware;
  let owner;
  let field;
  let farm;
  let farmunAuthorizedUser;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post('/user')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function postPseudoUserRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post('/user/pseudo')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest( { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(`/user/${user_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function putRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).put(`/user/${user_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function validate(reqData, resDate){
    Object.keys(reqData).map((key)=>{
      // if(resDate[key]!==req)
    })
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function fakeUser(user_id) {
    const user = mocks.fakeUser();
    return ({ ...user, user_id });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm]
    }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    done();
  });

  describe('Get && put user', () => {
    let user;
    let worker;
    let workerFarm;
    let crop;
    let unAuthorizedUser;
    beforeEach(async () => {
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));

      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser]
      }, fakeUserFarm(1));

    })


    describe('Get user', () => {
      test('Workers should get user by user id', async (done) => {
        getRequest({ user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].address).toBe(user.address);
          done();
        });
      })

      test('Workers should get user by date', async (done) => {
        getRequest(`/field_crop/farm/date/${farm.farm_id}/${moment().format('YYYY-MM-DD')}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].field_crop_id).toBe(user.field_crop_id);
          done();
        });
      })

      test('Workers should get user by id', async (done) => {
        getRequest(`/field_crop/${user.field_crop_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].field_crop_id).toBe(user.field_crop_id);
          done();
        });
      })

      describe('Get user authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm]
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })

        test('Owner should get user by user id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].field_crop_id).toBe(user.field_crop_id);
            done();
          });
        })

        test('Manager should get user by user id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: manager.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].field_crop_id).toBe(user.field_crop_id);
            done();
          });
        })

        test('Should get status 403 if an unauthorizedUser tries to get user by farm id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        })

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        })


      })
    })

    describe('Put user', () => {
      test('should be able to edit the area_used field', async (done) => {
        user.area_used = field.area * 0.1;
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(Math.floor(newuser.area_used)).toBe(Math.floor(user.area_used));
          done();
        })
      });

      test('should return status 400 and if area_used is bigger than the field', async (done) => {
        user.area_used = field.area + 1;
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(400);
          expect(res.error.text).toBe('Area needed is greater than the field\'s area');
          done();
        })
      });

      test('should edit and the estimated_production field', async (done) => {
        user.area_used = field.area * 0.1;
        user.estimated_production = 1;
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(newuser.estimated_production).toBe(1);
          done();
        })
      });

      test('should edit and the estimated_revenue field', async (done) => {
        user.area_used = field.area * 0.1;
        user.estimated_revenue = 1;
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(newuser.estimated_revenue).toBe(1);
          done();
        })
      });

      test('Expired route should filter out non-expired user', async (done) => {
        let user = mocks.fakeuser();
        user.area_used = field.area * 0.1;
        user.end_date = moment().add(10, 'd').toDate();
        getRequest(`/field_crop/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(0);
          done()
        });
      });

      test('should change the end_date to a future date', async (done) => {
        user.area_used = field.area * 0.1;
        user.end_date = moment().add(10, 'd').toDate();
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(newuser.end_date.toDateString()).toBe(user.end_date.toDateString());
          done();
        })
      });

      test('should change the end_date to a historical date', async (done) => {
        user.area_used = field.area * 0.1;
        user.end_date = moment().subtract(10, 'd').toDate();
        putRequest(user, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(newuser.end_date.toDateString()).toBe(user.end_date.toDateString());
          done();
        })
      });

      test('Expired route should not filter out non-expired user', async (done) => {
        let user = mocks.fakeuser();
        user.area_used = field.area * 0.1;
        user.end_date = moment().subtract(10, 'd').toDate();
        getRequest(`/field_crop/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          done()
        });
      });

      describe('Put user authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm]
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })
        //TODO: Owner test
        test('should edit and the area_used field by manager', async (done) => {
          user.area_used = field.area * 0.1;
          putRequest(user, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
            expect(Math.floor(newuser.area_used)).toBe(Math.floor(user.area_used));
            done();
          })
        });

        test('should return 403 when unauthorized user tries to edit user', async (done) => {
          user.estimated_revenue = 1;
          putRequest(user, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 when a worker tries to edit user', async (done) => {
          user.estimated_revenue = 1;
          putRequest(user, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          user.estimated_revenue = 1;
          putRequest(user, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      })
    });


  })

  describe('Post user', () => {
    let crop;

    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] }, {
        ...mocks.fakeCrop(),
        crop_common_name: "crop",
        user_added: true
      });
    })

    test('should return 400 status if user is posted w/o crop_id', async (done) => {
      let user = fakeUser(crop);
      delete user.crop_id;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_id[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if user is posted w/o area_used', async (done) => {
      let user = fakeUser(crop);
      delete user.area_used;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if user is posted w/o estimated_revenue', async (done) => {
      let user = fakeUser(crop);
      delete user.estimated_revenue;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if user is posted w/o estimated_production', async (done) => {
      let user = fakeUser(crop);
      delete user.estimated_production;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_production[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if user is posted w/ area > field.area', async (done) => {
      let user = fakeUser(crop);
      user.area_used = field.area + 1;
      user.estimated_production = 1;
      user.estimated_revenue = 1;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Area needed is greater than the field\'s area');
        done()
      })
    });

    test('should return 400 status if user is posted w/ area < 0', async (done) => {
      let user = fakeUser(crop);
      user.area_used = -1;
      user.estimated_production = 1;
      user.estimated_revenue = 1;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get a valid user (bed size and percentage)', async (done) => {
      let user = fakeUser(crop);
      user.estimated_revenue = 1;
      user.area_used = field.area * 0.25;
      user.estimated_production = 1;
      postUserRequest(user, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
        expect(newuser.field_id).toBe(field.field_id);
        done();
      })
    });

    test('should return 400 status if user is posted w/ estimated_revenue < 0', async (done) => {
      let user = fakeUser(crop);
      user.estimated_revenue = -1;
      user.area_used = field.area * 0.25;
      user.estimated_production = 1;
      postUserRequest(user, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get an expired crop', async (done) => {
      let user = fakeUser(crop);
      user.estimated_revenue = 1;
      user.area_used = field.area * 0.25;
      user.estimated_production = 1;
      user.start_date = moment().subtract(50, 'd').toDate();
      user.end_date = moment().subtract(20, 'd').toDate();
      postUserRequest(user, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
        expect(newuser.field_id).toBe(field.field_id);
        done();
      })
    });

    describe('Post user authorization', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [worker],
          promisedFarm: [farm]
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm]
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser]
        }, fakeUserFarm(1));
      })

      test('Should post then get a valid user by a manager', async (done) => {
        let user = fakeUser(crop);
        user.estimated_revenue = 1;
        user.area_used = field.area * 0.25;
        user.estimated_production = 1;
        postUserRequest(user, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const newuser = await userModel.query().where('crop_id', crop.crop_id).first();
          expect(newuser.field_id).toBe(field.field_id);
          done();
        })
      });

      test('Should return status 403 when a worker tries to post a valid user', async (done) => {
        let user = fakeUser(crop);
        user.estimated_revenue = 1;
        user.area_used = field.area * 0.25;
        user.estimated_production = 1;
        postUserRequest(user, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

      test('Should return status 403 when an unauthorized user tries to post a valid user', async (done) => {
        let user = fakeUser(crop);
        user.estimated_revenue = 1;
        user.area_used = field.area * 0.25;
        user.estimated_production = 1;
        postUserRequest(user, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        let user = fakeUser(crop);
        user.estimated_revenue = 1;
        user.area_used = field.area * 0.25;
        user.estimated_production = 1;
        postUserRequest(user, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

    });

  })

});
