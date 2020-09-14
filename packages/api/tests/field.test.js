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

// Describe test suite
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

        // Owner post field test
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

})