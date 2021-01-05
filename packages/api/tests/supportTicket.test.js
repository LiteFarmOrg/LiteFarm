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
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
jest.mock('../src/templates/sendEmailTemplate');

const mocks = require('./mock.factories');


const supportTicketModel = require('../src/models/supportTicketModel');

describe('supportTicket Tests', () => {
  let middleware;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post(`/support_ticket`)
      .set('Content-Type', 'multipart/form-data')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .field({
        _file_: data.attachments,
        data: JSON.stringify(data)
      })
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }


  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory({ promisedUser: [owner], promisedFarm: [farm] }, fakeUserFarm(1));

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Post support ticket', () => {
    let fakeSupportTicket;

    beforeEach(async () => {
      fakeSupportTicket = mocks.fakeSupportTicket(farm.farm_id);
    })

    test('Owner post support ticket', async (done) => {
      postRequest(fakeSupportTicket, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const supportTickets = await supportTicketModel.query().where('support_ticket_id', res.body.support_ticket_id);
        expect(supportTickets.length).toBe(1);
        expect(supportTickets[0].created_by_user_id).toBe(owner.user_id);
        done();
      })
    });

  });

});
