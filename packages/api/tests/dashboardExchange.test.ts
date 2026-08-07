/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Response } from 'superagent';
import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import { createToken } from '../src/util/jwt.js';
import { Farm, User, UserFarm } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/jobs/station_sync/mapping.js');
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));

interface ExchangeResponseBody {
  user_id?: User['user_id'];
  email?: User['email'];
  first_name?: User['first_name'];
  farm_id?: Farm['farm_id'] | null;
  farms?: {
    farm_id: Farm['farm_id'];
    farm_name: Farm['farm_name'];
    role_id: UserFarm['role_id'];
  }[];
  message?: string;
  ticket?: string;
  id_token?: string;
  token?: string;
  access_token?: string;
}

type ExchangeResponse = Omit<Response, 'body'> & { body: ExchangeResponseBody };

function postRequest(body: Record<string, unknown>): Promise<ExchangeResponse> {
  return chai
    .request(server)
    .post('/login/dashboard/exchange')
    .set('content-type', 'application/json')
    .send(body) as unknown as Promise<ExchangeResponse>;
}

function mintTicket({
  user_id,
  farm_id = null,
}: {
  user_id: User['user_id'];
  farm_id?: Farm['farm_id'] | null;
}) {
  return createToken('dashboard', { user_id, farm_id, jti: randomUUID() });
}

describe('POST /login/dashboard/exchange', () => {
  let user: User;
  let activeFarm: Farm;
  let secondActiveFarm: Farm;
  let invitedFarm: Farm;
  let deletedFarm: Farm;

  beforeAll(async () => {
    [user] = await mocks.usersFactory();

    [activeFarm] = await mocks.farmFactory();
    [secondActiveFarm] = await mocks.farmFactory();
    [invitedFarm] = await mocks.farmFactory();
    [deletedFarm] = await mocks.farmFactory();

    for (const farm of [activeFarm, secondActiveFarm, deletedFarm]) {
      await mocks.userFarmFactory({
        promisedUser: Promise.resolve([user]),
        promisedFarm: Promise.resolve([farm]),
      });
    }
    await mocks.userFarmFactory(
      {
        promisedUser: Promise.resolve([user]),
        promisedFarm: Promise.resolve([invitedFarm]),
      },
      mocks.fakeUserFarm({ status: 'Invited' }),
    );

    await knex('farm').update({ deleted: true }).where({ farm_id: deletedFarm.farm_id });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Successful exchange', () => {
    test('returns the user and the live farm list for a ticket naming no farm', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: user.user_id }) });

      expect(res.status).toBe(200);
      expect(res.body.user_id).toBe(user.user_id);
      expect(res.body.email).toBe(user.email);
      expect(res.body.first_name).toBe(user.first_name);
      expect(res.body.farm_id).toBe(null);
      expect(res.body.farms).toEqual(
        expect.arrayContaining([
          {
            farm_id: activeFarm.farm_id,
            farm_name: activeFarm.farm_name,
            role_id: expect.any(Number),
          },
          {
            farm_id: secondActiveFarm.farm_id,
            farm_name: secondActiveFarm.farm_name,
            role_id: expect.any(Number),
          },
        ]),
      );
      expect(res.body.farms).toHaveLength(2);
    });

    test('returns the farm the ticket names when the membership is Active', async () => {
      const res = await postRequest({
        ticket: await mintTicket({ user_id: user.user_id, farm_id: activeFarm.farm_id }),
      });

      expect(res.status).toBe(200);
      expect(res.body.farm_id).toBe(activeFarm.farm_id);
    });

    test('returns no token of any kind', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: user.user_id }) });

      expect(res.status).toBe(200);
      expect(res.body.ticket).toBeUndefined();
      expect(res.body.id_token).toBeUndefined();
      expect(res.body.token).toBeUndefined();
      expect(res.body.access_token).toBeUndefined();
    });

    test('is reachable with no Authorization header', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: user.user_id }) });

      expect(res.status).toBe(200);
    });
  });

  describe('Single use', () => {
    test('returns 401 when the same ticket is exchanged a second time', async () => {
      const ticket = await mintTicket({ user_id: user.user_id });

      const first = await postRequest({ ticket });
      const second = await postRequest({ ticket });

      expect(first.status).toBe(200);
      expect(second.status).toBe(401);
    });

    test('lets exactly one of two concurrent exchanges succeed', async () => {
      const ticket = await mintTicket({ user_id: user.user_id });

      const [first, second] = await Promise.all([postRequest({ ticket }), postRequest({ ticket })]);

      expect([first.status, second.status].sort()).toEqual([200, 401]);
    });
  });

  describe('Rejected tickets', () => {
    test('returns 401 for a ticket signed with JWT_SECRET', async () => {
      const ticket = await createToken('access', {
        user_id: user.user_id,
        farm_id: null,
        jti: randomUUID(),
      });

      const res = await postRequest({ ticket });

      expect(res.status).toBe(401);
    });

    test('returns 401 for an expired ticket', async () => {
      const ticket = jwt.sign(
        { user_id: user.user_id, farm_id: null, jti: randomUUID() },
        process.env.JWT_DASHBOARD_SECRET as string,
        { algorithm: 'HS256', expiresIn: '-1s' },
      );

      const res = await postRequest({ ticket });

      expect(res.status).toBe(401);
    });

    test('returns 400 when the body has no ticket', async () => {
      const res = await postRequest({});

      expect(res.status).toBe(400);
    });

    test('returns 401 for a validly signed ticket with no jti', async () => {
      const ticket = await createToken('dashboard', { user_id: user.user_id, farm_id: null });

      const res = await postRequest({ ticket });

      expect(res.status).toBe(401);
    });

    test('returns 401 for a ticket naming a user that does not exist', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: randomUUID() }) });

      expect(res.status).toBe(401);
    });
  });

  describe('Live membership', () => {
    let revokedUser: User;
    let revokedFarm: Farm;
    let keptFarm: Farm;

    beforeAll(async () => {
      [revokedUser] = await mocks.usersFactory();
      [revokedFarm] = await mocks.farmFactory();
      [keptFarm] = await mocks.farmFactory();

      for (const farm of [revokedFarm, keptFarm]) {
        await mocks.userFarmFactory({
          promisedUser: Promise.resolve([revokedUser]),
          promisedFarm: Promise.resolve([farm]),
        });
      }

      await knex('userFarm')
        .update({ status: 'Inactive' })
        .where({ user_id: revokedUser.user_id, farm_id: revokedFarm.farm_id });
    });

    test('returns 401 when the ticket names a farm the user is no longer Active on', async () => {
      const res = await postRequest({
        ticket: await mintTicket({
          user_id: revokedUser.user_id,
          farm_id: revokedFarm.farm_id,
        }),
      });

      expect(res.status).toBe(401);
    });

    test('omits a no-longer-Active farm from farms when the ticket names no farm', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: revokedUser.user_id }) });

      expect(res.status).toBe(200);
      expect(res.body.farms?.map(({ farm_id }) => farm_id)).toEqual([keptFarm.farm_id]);
    });

    test('omits a farm the user is only Invited to', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: user.user_id }) });

      expect(res.status).toBe(200);
      expect(res.body.farms?.map(({ farm_id }) => farm_id)).not.toContain(invitedFarm.farm_id);
    });

    test('omits a soft-deleted farm the user is an Active member of', async () => {
      const res = await postRequest({ ticket: await mintTicket({ user_id: user.user_id }) });

      expect(res.status).toBe(200);
      expect(res.body.farms?.map(({ farm_id }) => farm_id)).not.toContain(deletedFarm.farm_id);
    });
  });
});
