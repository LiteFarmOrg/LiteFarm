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

// Test suite
describe('Field Tests', () => {
    // Global constants
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

    // Functions used by tests

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

    function deleteRequest(url, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
      chai.request(server).delete(url)
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .end(callback)
    }

    function putFieldRequest(data, {user_id = newOwner.user_id, farm_id = farm.farm_id}, callback) {
      console.log("data farm id is " + data.farm_id)
      console.log("farm id is " + farm.farm_id)
      // const fieldId = data.field_id;
      const {field_id} = data;
      chai.request(server).put(`/field/${field_id}`)
        .set('farm_id', farm_id)
        .set('user_id', user_id)
        .send(data)
        .end(callback)
    }

    function getFakeField(farm_id = farm.farm_id){
        const field = mocks.fakeFieldForTests();
        return ({...field, farm_id});
      }

    function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
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
      let newField;
      let unAuthorizedUser;
      let farmunAuthorizedUser;
      let ownerFarmunAuthorizedUser;

      beforeEach(async()=>{
        [field] = await mocks.fieldFactory({promisedFarm: [farm]});
        [newField] = await mocks.fieldFactory({promisedFarm: [farm]});

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

      test('should edit the field_name field', async (done) => {
        console.log("field before field name change")
        console.log(newField)
        console.log("field after field name change")
        newField.field_name = "My new field name";
        console.log(newField)

        field.field_name = "My new field name";
        putFieldRequest(newField,{}, async (err, res) => {
          console.log("error is")
          console.log(res.error)
          // console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          // const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
          // expect(Math.floor(newFieldCrop.area_used)).toBe(Math.floor(fieldCrop.area_used));
          done();
        })
        // done();
      });

    })

  })

  // describe('Put field tests', ()=>{
  //   let fakeField;
  //   let field;
  //   let worker;
  //   let workersFarm
  //   let manager;
  //   let managersFarm;
  //   let unAuthorizedUser;
  //   let farmunAuthorizedUser;
  //   let ownersFarmunAuthorizedUser;

    

  //   beforeEach(async()=>{
  //     fakeField = getFakeField();
  //     [field] = await mocks.fieldFactory({promisedFarm: [farm]});
  //     [worker] = await mocks.usersFactory();
  //     [workersFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
  //     [manager] = await mocks.usersFactory();
  //     [managersFarm] = await mocks.userFarmFactory({promisedUser:[manager], promisedFarm:[farm]},fakeUserFarm(2));  

  //     [unAuthorizedUser] = await mocks.usersFactory();
  //     [farmunAuthorizedUser] = await mocks.farmFactory();
  //     [ownersFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));

      
  //   })

  //   test('should edit field_name by owner', async (done) => {

  //     field.field_name = "My new field name";

  //     // field[0].field_name = "New Field Name";
  //     putFieldRequest(field, {user_id: newOwner.user_id, farm_id: ownerFarm.farm_id}, async (err, res) => {
  //       // console.log(fieldCrop,res.error);
  //       expect(res.status).toBe(200);
  //       // const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
  //       // expect(Math.floor(newFieldCrop.area_used)).toBe(Math.floor(fieldCrop.area_used));
  //       done();
  //     })
  //   });





  // })

})