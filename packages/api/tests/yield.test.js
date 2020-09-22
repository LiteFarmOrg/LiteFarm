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
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
jest.mock('../src/jobs/station_sync/mapping')
const mocks  = require('./mock.factories');

const yieldModel = require('../src/models/yieldModel');

describe('Yield Tests', () => {
    // GLOBAL CONSTANTS
    let middleware;
    let farm;
    let newOwner;
    let crop;

    beforeAll(() => {
      token = global.token;
    });

    // FUNCTIONS

    function postYieldRequest( data, {user_id = newOwner.user_id, farm_id= farm.farm_id}, callback) {
        chai.request(server).post('/yield')
          .set('Content-Type', 'application/json')
          .set('user_id', user_id)
          .set('farm_id', farm_id)
          .send(data)
          .end(callback)
    }

    function getFakeYield(crop_id = crop.crop_id){
        const yield1 = mocks.fakeYield();
        return ({...yield1, crop_id});
      }

    function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
    }


    // GLOBAL BEFOREEACH
    beforeEach(async () => {
        [farm] = await mocks.farmFactory();
        [newOwner] = await mocks.usersFactory();
        [crop] = await mocks.cropFactory({promisedFarm: [farm]});
        


        middleware = require('../src/middleware/acl/checkJwt');
        middleware.mockImplementation((req, res, next) => {
          req.user = {};
          req.user.sub = '|' + req.get('user_id');
          next()
        });
      })

      afterEach (async () => {
        await tableCleanup(knex);
      });


      // POST TESTS
      describe('Post yield tests', ()=>{
        
        let ownerFarm;

        let newManager;
        let managerFarm;

        let newWorker;
        let workerFarm;

        let unAuthorizedUser;
        let farmunAuthorizedUser;
        let ownerFarmunAuthorizedUser;
      
       


        beforeEach(async()=>{
            

            [ownerFarm] = await mocks.userFarmFactory({promisedUser:[newOwner], promisedFarm:[farm]},fakeUserFarm(1));

            [newManager] = await mocks.usersFactory();
            [managerFarm] = await mocks.userFarmFactory({promisedUser:[newManager], promisedFarm:[farm]},fakeUserFarm(2));

            [newWorker] = await mocks.usersFactory();
            [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));

            [unAuthorizedUser] = await mocks.usersFactory();
            [farmunAuthorizedUser] = await mocks.farmFactory();
            [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({promisedUser:[unAuthorizedUser], promisedFarm:[farmunAuthorizedUser]},fakeUserFarm(1));
       

         


        })

        test('Owner should post and get valid yield', async (done) => {
            let fakeYield1 = getFakeYield();
            fakeYield1.farm_id = ownerFarm.farm_id;
            postYieldRequest(fakeYield1, {user_id: newOwner.user_id, farm_id: ownerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const yields = await yieldModel.query().where('farm_id',farm.farm_id);
                expect(yields.length).toBe(1);
                expect(yields[0].yield_id).toBe(fakeYield1.yield_id);
                done();
              })
        })

        test('Manager should post and get a valid yield', async (done) => {
            let fakeYield2 = getFakeYield();
            fakeYield2.farm_id = managerFarm.farm_id;
            postYieldRequest(fakeYield2, {user_id: newManager.user_id, farm_id: managerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(201);
                const yields = await yieldModel.query().where('farm_id',farm.farm_id);
                expect(yields.length).toBe(1);
                expect(yields[0].yield_id).toBe(fakeYield2.yield_id);
                done();
            })
        });

        test('Should return 403 when worker tries to post yield', async (done) => {
            let fakeYield3 = getFakeYield();
            fakeYield3.farm_id = workerFarm.farm_id;
            postYieldRequest(fakeYield3, {user_id: newWorker.user_id, farm_id: workerFarm.farm_id}, async (err, res) => {
                expect(res.status).toBe(403);
                expect(res.error.text).toBe("User does not have the following permission(s): add:yields");
                done();
            })
        });

        test('Should return 403 when unauthorized user tries to post yield', async (done) => {
            let fakeYield4 = getFakeYield();
            fakeYield4.farm_id = ownerFarmunAuthorizedUser.farm_id;
            postYieldRequest(fakeYield4, {user_id: unAuthorizedUser.user_id}, (err, res) => {
              expect(res.status).toBe(403);
              done();
            });
          });

    })

})