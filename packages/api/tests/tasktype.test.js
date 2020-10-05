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
const Knex = require('knex')
const environment = process.env.TEAMCITY_DOCKER_NETWORK ? 'pipeline': 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');

const taskTypeModel = require('../src/models/taskTypeModel');

describe('taskType Tests', () => {
  let middleware;
  let owner;
  let farm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postRequest( data, {user_id = owner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).post(`/task_type`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest({user_id = owner.user_id, farm_id = farm.farm_id, url = `/task_type/farm/${farm.farm_id}`}, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function deleteRequest({user_id = owner.user_id, farm_id = farm.farm_id, task_id}, callback) {
    chai.request(server).delete(`/task_type/${task_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }

  function getfakeTaskType(farm_id = farm.farm_id){
    const taskType = mocks.fakeTaskType();
    return ({...taskType, farm_id});
  }

  beforeEach(async () => {
    await knex.raw('DELETE from "taskType"');
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[owner], promisedFarm:[farm]},fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterAll (async (done) => {
    await tableCleanup(knex);
    done();
  });

  describe('Get && delete taskType',()=>{
    let taskType;
    beforeEach(async()=>{
      [taskType] = await mocks.taskTypeFactory({promisedFarm: [farm]});
    })

    test('Get by farm_id should filter out deleted task types', async (done)=>{
      await taskTypeModel.query().findById(taskType.task_id).delete();
      getRequest({user_id: owner.user_id},(err,res)=>{
        expect(res.status).toBe(404);
        done();
      });
    })

    test('Get by task_id should filter out deleted task types', async (done)=>{
      await taskTypeModel.query().findById(taskType.task_id).delete();
      getRequest({user_id: owner.user_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
        expect(res.status).toBe(404);
        done();
      });
    })

    test('Workers should get seeded taskType', async (done)=>{
      let [seedtaskType] = await knex('taskType').insert({...mocks.fakeTaskType(), farm_id: null}).returning('*');
      getRequest({user_id: owner.user_id},(err,res)=>{
        expect(res.status).toBe(200);
        expect(res.body[1].taskType_id).toBe(seedtaskType.taskType_id);
        done();
      });
    })

      describe('Get task type  authorization tests',()=>{
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Owner should get taskType by farm id', async (done)=>{
          getRequest({user_id: owner.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })

        test('Manager should get taskType by farm id', async (done)=>{
          getRequest({user_id: manager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })

        test('Worker should get taskType by farm id', async (done)=>{
          getRequest({user_id: worker.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })


        test('Should get status 403 if an unauthorizedUser tries to get taskType by farm_id', async (done)=>{
          getRequest({user_id: unAuthorizedUser.user_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest({user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })



        test('Owner should get taskType by task_id', async (done)=>{
          getRequest({user_id: owner.user_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })

        test('Manager should get taskType by task_id', async (done)=>{
          getRequest({user_id: manager.user_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })

        test('Worker should get taskType by task_id', async (done)=>{
          getRequest({user_id: worker.user_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].task_id).toBe(taskType.task_id);
            done();
          });
        })


        test('Should get status 403 if an unauthorizedUser tries to get taskType by task_id', async (done)=>{
          getRequest({user_id: unAuthorizedUser.user_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })

        test('Get taskType by task_id circumvent authorization by modifying farm_id', async (done) => {
          getRequest({user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, url:`/task_type/${taskType.task_id}`},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })





      })

    describe('Delete task type', function () {

      test('should return 403 if user tries to delete a seeded taskType', async (done) => {
        let [seedTaskType] = await knex('taskType').insert({...mocks.fakeTaskType(), farm_id: null}).returning('*');
        deleteRequest({task_id: seedTaskType.task_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      describe('Delete task type authorization tests',()=>{
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async()=>{
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
        })

        test('Owner should delete a task type', async (done) => {
          deleteRequest({task_id: taskType.task_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const taskTypeRes = await taskTypeModel.query().where('task_id',taskType.task_id);
            expect(taskTypeRes.length).toBe(1);
            expect(taskTypeRes[0].deleted).toBe(true);
            done();
          })
        });

        test('Manager should delete a taskType', async (done) => {
          deleteRequest({user_id:manager.user_id, task_id: taskType.task_id}, async (err, res) => {
            expect(res.status).toBe(200);
            const taskTypeRes = await taskTypeModel.query().where('task_id',taskType.task_id);
            expect(taskTypeRes.length).toBe(1);
            expect(taskTypeRes[0].deleted).toBe(true);
            done();
          })
        });

        test('should return 403 if an unauthorized user tries to delete a taskType', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, task_id: taskType.task_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('should return 403 if a worker tries to delete a taskType', async (done) => {
          deleteRequest({user_id: worker.user_id, task_id: taskType.task_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          deleteRequest({user_id:unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id, task_id: taskType.task_id}, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          })
        });


      })


  })


  })






  describe('Post taskType', () => {
    let fakeTaskType;

    beforeEach(async()=>{
        fakeTaskType = getfakeTaskType();
    })

    test('should return 403 status if headers.farm_id is set to null', async (done) => {
      fakeTaskType.farm_id = null;
      postRequest(fakeTaskType, {}, (err, res) => {
        expect(res.status).toBe(403);
        done()
      })
    });

    describe('Post taskType authorization tests', ()=>{

      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async()=>{
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({promisedUser:[worker], promisedFarm:[farm]},fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
      })

      test('Owner should post and get a valid taskType', async (done) => {
        postRequest(fakeTaskType, {}, async (err, res) => {
          expect(res.status).toBe(201);
          const taskTypes = await taskTypeModel.query().where('farm_id',farm.farm_id);
          expect(taskTypes.length).toBe(1);
          expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
          done();
        })
      });

      test('Manager should post and get a valid taskType', async (done) => {
        postRequest(fakeTaskType, {user_id: manager.user_id}, async (err, res) => {
          expect(res.status).toBe(201);
          const taskTypes = await taskTypeModel.query().where('farm_id',farm.farm_id);
          expect(taskTypes.length).toBe(1);
          expect(taskTypes[0].task_name).toBe(fakeTaskType.task_name);
          done();
        })
      });

      test('should return 403 status if taskType is posted by worker', async (done) => {
        postRequest(fakeTaskType, {user_id: worker.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:task_types");
          done()
        })
      });

      test('should return 403 status if taskType is posted by unauthorized user', async (done) => {
        postRequest(fakeTaskType, {user_id: unAuthorizedUser.user_id}, async (err, res) => {
          expect(res.status).toBe(403);
          expect(res.error.text).toBe("User does not have the following permission(s): add:task_types");
          done()
        })
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        postRequest(fakeTaskType, {user_id: unAuthorizedUser.user_id, farm_id: farmunAuthorizedUser.farm_id}, async (err, res) => {
          expect(res.status).toBe(403);
          done()
        })
      });

    })


  });
});
