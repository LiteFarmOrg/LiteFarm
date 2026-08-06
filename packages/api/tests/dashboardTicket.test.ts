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
import { Response } from 'superagent';
import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import { createToken } from '../src/util/jwt.js';
import { Farm, User } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/jobs/station_sync/mapping.js');
jest.mock('../src/templates/sendEmailTemplate.js', () => ({
  sendEmail: jest.fn(),
  emails: { INVITATION: { path: 'invitation_to_farm_email' } },
}));

const ALLOWED_RETURN_ADDRESSES = [
  'https://dashboard.test/auth/finish',
  'https://second-host.test/litefarm/auth/finish',
];
const [ALLOWED_RETURN_TO] = ALLOWED_RETURN_ADDRESSES;

interface TicketResponseBody {
  ticket: string;
  return_to: string;
  message?: string;
}

interface DashboardTicket extends jwt.JwtPayload {
  user_id: User['user_id'];
  farm_id: Farm['farm_id'] | null;
  jti: string;
  iat: number;
  exp: number;
}

type TicketResponse = Omit<Response, 'body'> & { body: TicketResponseBody };

function postRequest(
  body: Record<string, unknown>,
  { authorization }: { authorization?: string } = {},
): Promise<TicketResponse> {
  const request = chai
    .request(server)
    .post('/login/dashboard/ticket')
    .set('content-type', 'application/json');

  if (authorization) {
    request.set('Authorization', authorization);
  }

  return request.send(body) as unknown as Promise<TicketResponse>;
}

function decodeTicket(ticket: string): DashboardTicket {
  return jwt.verify(ticket, process.env.JWT_DASHBOARD_SECRET as string) as DashboardTicket;
}

describe('POST /login/dashboard/ticket', () => {
  let user: User;
  let otherUser: User;
  let activeFarm: Farm;
  let strangerFarm: Farm;
  let inactiveFarm: Farm;
  let invitedFarm: Farm;
  let authorization: string;

  beforeAll(async () => {
    [user] = await mocks.usersFactory();
    [otherUser] = await mocks.usersFactory();

    [activeFarm] = await mocks.farmFactory();
    [strangerFarm] = await mocks.farmFactory();
    [inactiveFarm] = await mocks.farmFactory();
    [invitedFarm] = await mocks.farmFactory();

    await mocks.userFarmFactory({
      promisedUser: Promise.resolve([user]),
      promisedFarm: Promise.resolve([activeFarm]),
    });
    await mocks.userFarmFactory(
      {
        promisedUser: Promise.resolve([user]),
        promisedFarm: Promise.resolve([inactiveFarm]),
      },
      mocks.fakeUserFarm({ status: 'Inactive' }),
    );
    await mocks.userFarmFactory(
      {
        promisedUser: Promise.resolve([user]),
        promisedFarm: Promise.resolve([invitedFarm]),
      },
      mocks.fakeUserFarm({ status: 'Invited' }),
    );

    authorization = `Bearer ${await createToken('access', { user_id: user.user_id })}`;
  });

  beforeEach(() => {
    process.env.DASHBOARD_ALLOWED_RETURN_TO = ALLOWED_RETURN_ADDRESSES.join(',');
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Identity', () => {
    test('names the token holder, not a user_id supplied in the body', async () => {
      const res = await postRequest(
        { return_to: ALLOWED_RETURN_TO, user_id: otherUser.user_id },
        { authorization },
      );

      expect(res.status).toBe(200);
      expect(decodeTicket(res.body.ticket).user_id).toBe(user.user_id);
    });

    test('returns 401 without an Authorization header', async () => {
      const res = await postRequest({ return_to: ALLOWED_RETURN_TO });

      expect(res.status).toBe(401);
      expect(res.body.ticket).toBeUndefined();
    });
  });

  describe('Farm membership', () => {
    test('issues a ticket for a farm the user is an Active member of', async () => {
      const res = await postRequest(
        { return_to: ALLOWED_RETURN_TO, farm_id: activeFarm.farm_id },
        { authorization },
      );

      expect(res.status).toBe(200);
      expect(decodeTicket(res.body.ticket).farm_id).toBe(activeFarm.farm_id);
    });

    test('issues a ticket with a null farm_id when the body omits farm_id', async () => {
      const res = await postRequest({ return_to: ALLOWED_RETURN_TO }, { authorization });

      expect(res.status).toBe(200);
      expect(decodeTicket(res.body.ticket).farm_id).toBe(null);
    });

    test.each([
      ['no userFarm row at all', () => strangerFarm],
      ['an Inactive userFarm row', () => inactiveFarm],
      ['an Invited userFarm row', () => invitedFarm],
    ])('returns 403 for a farm with %s', async (_label, getFarm) => {
      const res = await postRequest(
        { return_to: ALLOWED_RETURN_TO, farm_id: getFarm().farm_id },
        { authorization },
      );

      expect(res.status).toBe(403);
      expect(res.body.ticket).toBeUndefined();
    });
  });

  describe('Return address allowlist', () => {
    test.each(ALLOWED_RETURN_ADDRESSES)('issues a ticket for %s', async (return_to) => {
      const res = await postRequest({ return_to }, { authorization });

      expect(res.status).toBe(200);
      expect(res.body.return_to).toBe(return_to);
    });

    test.each([
      ['absent', undefined],
      ['an unrelated address', 'https://attacker.example'],
      ['a prefix of an allowed address', ALLOWED_RETURN_TO.slice(0, -3)],
      ['a suffix of an allowed address', new URL(ALLOWED_RETURN_TO).pathname],
      ['a substring of an allowed address', ALLOWED_RETURN_TO.replace('https://', '')],
      ['an allowed address with an appended segment', `${ALLOWED_RETURN_TO}.attacker.example`],
    ])('returns 400 when return_to is %s', async (_label, return_to) => {
      const res = await postRequest({ return_to }, { authorization });

      expect(res.status).toBe(400);
      expect(res.body.ticket).toBeUndefined();
    });

    test.each([
      ['unset', undefined],
      ['blank', ''],
      ['a lone comma', ','],
    ])(
      'rejects an empty return_to when DASHBOARD_ALLOWED_RETURN_TO is %s',
      async (_label, allowlist) => {
        if (allowlist === undefined) {
          delete process.env.DASHBOARD_ALLOWED_RETURN_TO;
        } else {
          process.env.DASHBOARD_ALLOWED_RETURN_TO = allowlist;
        }

        const res = await postRequest({ return_to: '' }, { authorization });

        expect(res.status).toBe(400);
        expect(res.body.ticket).toBeUndefined();
      },
    );
  });

  describe('Ticket properties', () => {
    test('expires 30 seconds after it is issued', async () => {
      const res = await postRequest({ return_to: ALLOWED_RETURN_TO }, { authorization });
      const { iat, exp } = decodeTicket(res.body.ticket);

      expect(exp - iat).toBe(30);
    });

    test('does not verify against JWT_SECRET', async () => {
      const res = await postRequest({ return_to: ALLOWED_RETURN_TO }, { authorization });

      expect(() => jwt.verify(res.body.ticket, process.env.JWT_SECRET as string)).toThrow();
    });

    test('carries a jti that differs between two tickets', async () => {
      const [first, second] = await Promise.all([
        postRequest({ return_to: ALLOWED_RETURN_TO }, { authorization }),
        postRequest({ return_to: ALLOWED_RETURN_TO }, { authorization }),
      ]);

      const firstJti = decodeTicket(first.body.ticket).jti;
      const secondJti = decodeTicket(second.body.ticket).jti;

      expect(firstJti).toBeTruthy();
      expect(secondJti).toBeTruthy();
      expect(firstJti).not.toBe(secondJti);
    });
  });
});
