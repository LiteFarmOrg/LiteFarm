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
const moment =require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');
const fieldModel = require('../src/models/fieldModel');
describe('Field Tests', () => {
    // GLOBAL CONSTANTS
    let middleware;
    let newOwner;
    let ownerFarm;
    let newManager;
    let managerFarm;
    let newWorker;
    let workerFarm;
    let farm;
    beforeAll(() => {
      token = global.token;
    });
    // FUNCTIONS
    function postFieldRequest( data, {user_id = newOwner.user_id, farm_id= farm.field_id}, callback) {
        chai.request(server).post('/field')
          .set('Content-Type', 'application/json')
          .set('user_id', user_id)
          .set('farm_id', farm_id)
          .send(data)
          .end(callback)
    }
    function getRequest({user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
    chai.request(server).get(`/field/farm/${farm_id}`)
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .end(callback)
    }
    function getFakeField(farm_id = farm.farm_id){
        const field = mocks.fakeFieldForTests();
        return ({...field, farm_id});
      }
    function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
    }
    function deleteRequest(data, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
      const {field_id} = data;
      console.log("data is")
      console.log(data)
      console.log("field is is")
      console.log(field_id)
      chai.request(server).delete(`/field/${field_id}`)
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .end(callback)
      console.log("data after deleting is")
      console.log(data)
    }
    function putFieldRequest(data, { user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
      const {field_id} = data;
      // console.log("data is " + JSON.stringify(data))
      chai.request(server).put(`/field/${field_id}`)
        .set('farm_id', farm_id)
        .set('user_id', user_id)
        .send(data)
        .end(callback)
    }
    beforeEach(async () => {
        [newOwner] = await mocks.usersFactory();
        [newManager] = await mocks.usersFactory();
        [newWorker] = await mocks.usersFactory();
        [farm] = await mocks.farmFactory();
        [ownerFarm] = await mocks.userFarmFactory({promisedUser:[newOwner], promisedFarm:[farm]},fakeUserFarm(1));
        [managerFarm] = await mocks.userFarmFactory({promisedUser:[newManager], promisedFarm:[farm]},fakeUserFarm(2));
        [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
        middleware = require('../src/middleware/acl/checkJwt');
        middleware.mockImplementation((req, res, next) => {
          req.user = {};
          req.user.sub = '|' + req.get('user_id');
          next()
        });
      })
      afterEach (async () => {
        await knex.raw(`
        DELETE FROM "field";
        `);
      });
      // All the post field tests
      describe('Post field tests', ()=>{
        let fakeField;
        beforeEach(async()=>{
            fakeField = getFakeField();
        })
        test('Owner should post and get valid field', async (done) => {
            postFieldRequest(fakeField, {user_id: newOwner.user_id, farm_id: ownerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const fields = await fieldModel.query().where('farm_id',farm.farm_id);
                expect(fields.length).toBe(1);
                expect(fields[0].field_name).toBe(fakeField.field_name);
                done();
              })
        })
        test('Manager should post and get a valid field', async (done) => {
            postFieldRequest(fakeField, {user_id: newManager.user_id, farm_id: managerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const fields = await fieldModel.query().where('farm_id',farm.farm_id);
                expect(fields.length).toBe(1);
                expect(fields[0].field_name).toBe(fakeField.field_name);
                done();
            })
      });
        test('Worker should not post and get a valid field', async (done) => {
            postFieldRequest(fakeField, {user_id: newWorker.user_id, farm_id: workerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): add:fields");
                done();
            })
        });
    })
    describe('Get && delete && put field tests', ()=>{
      let field;
      let ownerField;
      let unAuthorizedUser;
      let farmunAuthorizedUser;
      let ownerFarmunAuthorizedUser;
      beforeEach(async()=>{
        [field] = await mocks.fieldFactory({promisedFarm: [farm]});
        delete field.station_id;
        [ownerField] = await mocks.fieldFactory({promisedFarm: [farm]});
        delete ownerField.station_id;
        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
    })
      describe('Get field tests', ()=>{
        test('Owner should get field by farm id', async (done)=>{
            getRequest({user_id: newOwner.user_id},(err,res)=>{
              expect(res.status).toBe(200);
              expect(res.body[0].farm_id).toBe(field.farm_id);
              done();
            });
          })
        test('Manager should get field by farm id', async (done)=>{
          getRequest({user_id: newManager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].farm_id).toBe(field.farm_id);
            done();
          });
        })
        test('Worker should get field by farm id', async (done)=>{
          getRequest({user_id: newWorker.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].farm_id).toBe(field.farm_id);
            done();
          });
        })
        test('Should get status 403 if an unauthorizedUser tries to get field by farm id', async (done)=>{
          getRequest({user_id: unAuthorizedUser.user_id},(err,res)=>{
            expect(res.status).toBe(403);
            done();
          });
        })
      })
      describe('Put field tests', ()=>{
        test('Owner should update field_name', async (done)=>{
          field.field_name = "My new field name -- owner";
            putFieldRequest(field, {},(err,res)=>{
              expect(res.status).toBe(200);
              expect(res.body[0].field_name).toBe("My new field name -- owner");
              done();
           });
        })
        test('Manager should update field_name', async (done)=>{
          let field1;
          [field1] = await mocks.fieldFactory({promisedFarm: [managerFarm]});
          delete field1.station_id;
          field1.field_name = "My new field name -- manager";
          console.log("field1 is")
          console.log(field1)
          putFieldRequest(field1, {user_id: newManager.user_id},(err,res)=>{
            expect(res.status).toBe(200);
            expect(res.body[0].field_name).toBe("My new field name -- manager");
            done();
          });
        })
        test('should return 403 when a worker tries to edit field_name', async (done) => {
          let field2;
          [field2] = await mocks.fieldFactory({promisedFarm: [workerFarm]});
          delete field2.station_id;
          field2.field_name = "My new field name -- worker";
          putFieldRequest(field2,{user_id: newWorker.user_id}, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });
        test('should return 403 when unauthorized user tries to edit field_name', async (done) => {
          let field3;
          [field3] = await mocks.fieldFactory({promisedFarm: [farmunAuthorizedUser]});
          delete field3.station_id;
          field3.field_name = "My new field name -- unauthorized";
          putFieldRequest(field3, {user_id: unAuthorizedUser.user_id}, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });
    })
  //   describe('Delete field tests', ()=>{
  //     let managerFarm1;
  //     [managerFarm1] = await mocks.userFarmFactory({promisedUser:[newManager], promisedFarm:[farm]},fakeUserFarm(2));
  //     let newManager1;
  //     [newManager1] = await mocks.usersFactory();
  //     test.only('Manager should delete their field', async (done)=>{
  //       let field4;
  //       [field4] = await mocks.fieldFactory({promisedFarm: [managerFarm1]});
  //       // delete field4.station_id;
  //       deleteRequest(field4, {user_id: newManager1.user_id}, async (err,res)=>{
  //         expect(res.status).toBe(200);
  //         const fields = await fieldModel.query().where('field_id',field4.field_id);
  //         // console.log("fields is")
  //         // console.log(fields)
  //         // expect(fields.length).toBe(1);
  //         // expect(fields[0].field_name).toBe(fakeField.field_name);
  //         done();
  //       });
  //     })
  // })
  })
})