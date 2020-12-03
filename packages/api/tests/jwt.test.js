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
const {createAccessTokenSync} = require('../src/util/jwt');
jest.mock('jsdom')

describe('JWT Tests', () => {
  let newUser;

  afterAll((done) => {
    server.close(() =>{
      done();
    });
  })


  beforeEach(async () => {
    [newUser] = await usersFactory();
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Delete a Farm', () => {
    test('should succeed on deleting a farm with valid token', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      deleteRequest(farm, newUser.user_id, async (err,res) => {
        expect(res.status).toBe(200);
        const [farmQuery] = await knex.select().from('farm').where({farm_id: farm.farm_id});
        expect(farmQuery.deleted).toBe(true);
        done()
      });
    })

    test('should fail on deleting a farm without valid token', async (done) => {
      const [farm] = await farmFactory();
      await userFarmFactory({promisedUser: [newUser], promisedFarm: [farm]}, {role_id: 1, status: 'Active'});
      deleteRequestWithoutToken(farm, newUser.user_id, async (err,res) => {
        expect(res.status).toBe(401);
        const [farmQuery] = await knex.select().from('farm').where({farm_id: farm.farm_id});
        expect(farmQuery.deleted).toBe(false);
        done()
      });
    })
  });
});

function deleteRequest(data, user, callback) {
  chai.request(server).delete(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user)
    .set('Authorization', getAuthorizationHeader(data))
    .end(callback)
}

function deleteRequestWithoutToken(data, user, callback){
  chai.request(server).delete(`/farm/${data.farm_id}`)
    .set('farm_id', data.farm_id)
    .set('user_id', user)
    .set('Authorization', 'token')
    .end(callback)
}

function getAuthorizationHeader(user_id){
  return createAccessTokenSync({user_id})
}
