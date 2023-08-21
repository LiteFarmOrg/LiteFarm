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

import chai from 'chai';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));

import mocks from './mock.factories.js';
import supportTicketModel from '../src/models/supportTicketModel.js';

describe('supportTicket Tests', () => {
  let token;
  let owner;
  let farm;
  let ownerFarm;

  beforeAll(() => {
    token = global.token;
  });

  function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .post(`/support_ticket`)
      .set('Content-Type', 'multipart/form-data')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .field({
        _file_: data.attachments,
        data: JSON.stringify(data),
      })
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [ownerFarm] = await mocks.userFarmFactory(
      { promisedUser: [owner], promisedFarm: [farm] },
      fakeUserFarm(1),
    );
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Post support ticket', () => {
    let fakeSupportTicket;

    beforeEach(async () => {
      fakeSupportTicket = mocks.fakeSupportTicket(farm.farm_id);
    });

    test('Owner post support ticket', async (done) => {
      postRequest(fakeSupportTicket, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const supportTickets = await supportTicketModel
          .query()
          .context({ showHidden: true })
          .where('support_ticket_id', res.body.support_ticket_id);
        expect(supportTickets.length).toBe(1);
        expect(supportTickets[0].created_by_user_id).toBe(owner.user_id);
        done();
      });
    });
  });
});
