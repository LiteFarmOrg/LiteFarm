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
import { Response } from 'superagent';
import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import { createToken } from '../src/util/jwt.js';
import { Farm, SurveyResponse, User } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/jobs/station_sync/mapping.js');

import mocks from './mock.factories.js';
import { addUserToFarm, createUserFarmIds, fakeUserFarm } from './utils/testDataSetup.js';

type TapeResponseResponse = Omit<Response, 'body'> & {
  body: SurveyResponse[] & { error?: string };
};

describe('Dashboard TAPE response endpoint tests', () => {
  let owner: User;
  let farm: Farm;

  function tapeToken(userId: User['user_id']) {
    return createToken('dashboardApi', { user_id: userId, aud: 'tape' });
  }

  async function getRequest({
    user_id = owner.user_id,
    token = tapeToken(user_id),
    query = { farm_ids: farm.farm_id } as Record<string, string> | string,
    path = '/dashboard/tape_responses',
  }: {
    user_id?: User['user_id'];
    token?: string | null;
    query?: Record<string, string> | string;
    path?: string;
  } = {}): Promise<TapeResponseResponse> {
    const request = chai.request(server).get(path).query(query);
    if (token) {
      request.set('Authorization', `Bearer ${token}`);
    }
    return request as unknown as Promise<TapeResponseResponse>;
  }

  async function addSurveyResponse(
    survey_key: string,
    created_at: string,
    { farm_id = farm.farm_id, user_id = owner.user_id } = {},
  ) {
    return mocks.survey_responseFactory(
      { promisedUserFarm: Promise.resolve([{ farm_id, user_id }]) },
      mocks.fakeSurveyResponse({ survey_key, created_at }),
    );
  }

  function createdAts(rows: SurveyResponse[]) {
    return rows.map(({ created_at }) => new Date(created_at).toISOString());
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    await addUserToFarm(owner.user_id, farm);
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('GET /dashboard/tape_responses', () => {
    describe('Tokens', () => {
      test('Should return 401 for the soil lab result token', async () => {
        const token = createToken('dashboardApi', {
          user_id: owner.user_id,
          aud: 'soil_lab_result',
        });
        const res = await getRequest({ token });
        expect(res.status).toBe(401);
      });

      test('Should accept the TAPE token only on the exact path', async () => {
        const route = await getRequest();
        const suffixed = await getRequest({ path: '/dashboard/tape_responses_x' });
        const nested = await getRequest({ path: '/dashboard/tape_responses/x' });
        expect(route.status).toBe(200);
        expect(suffixed.status).toBe(401);
        expect(nested.status).toBe(401);
      });
    });

    describe('Access', () => {
      test('Should return 403 for a user without consent', async () => {
        await knex('user_consent').where({ user_id: owner.user_id }).delete();
        const res = await getRequest();
        expect(res.status).toBe(403);
      });

      test('All roles should be able to get the responses', async () => {
        const roles = [1, 2, 3, 5];
        for (const role of roles) {
          const userFarmIds = await createUserFarmIds(role);
          await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z', userFarmIds);

          const res = await getRequest({
            user_id: userFarmIds.user_id,
            query: { farm_ids: userFarmIds.farm_id },
          });
          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
        }
      });

      test('Should return 403 if user is not part of the farm', async () => {
        const otherFarm = await createUserFarmIds(1);
        const res = await getRequest({ query: { farm_ids: otherFarm.farm_id } });
        expect(res.status).toBe(403);
      });

      test("Should return 403 for the whole request when one farm is not the user's", async () => {
        const otherFarm = await createUserFarmIds(1);
        const res = await getRequest({
          query: { farm_ids: `${farm.farm_id},${otherFarm.farm_id}` },
        });
        expect(res.status).toBe(403);
      });

      test('Should return 403 for a removed member', async () => {
        const [removedMember] = await mocks.usersFactory();
        await addUserToFarm(removedMember.user_id, farm, {
          ...fakeUserFarm(1),
          status: 'Inactive',
        });
        const res = await getRequest({ user_id: removedMember.user_id });
        expect(res.status).toBe(403);
      });

      test('Should return 403 for an invited user', async () => {
        const [invitedUser] = await mocks.usersFactory();
        await addUserToFarm(invitedUser.user_id, farm, { ...fakeUserFarm(1), status: 'Invited' });
        const res = await getRequest({ user_id: invitedUser.user_id });
        expect(res.status).toBe(403);
      });

      test('Should return 403 for a deleted farm', async () => {
        await knex('farm').update({ deleted: true }).where({ farm_id: farm.farm_id });
        const res = await getRequest();
        expect(res.status).toBe(403);
      });
    });

    describe('Responses', () => {
      test('Should return the TAPE survey keys and leave out other surveys', async () => {
        await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z');
        await addSurveyResponse('tape_land_aweai', '2026-09-11T12:00:00.000Z');
        await addSurveyResponse('tape_au', '2026-09-12T12:00:00.000Z');
        await addSurveyResponse('tape_bc', '2026-09-13T12:00:00.000Z');
        await addSurveyResponse('cathi_gao', '2026-09-14T12:00:00.000Z');
        await addSurveyResponse('tapex', '2026-09-15T12:00:00.000Z');

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body.map(({ survey_key }) => survey_key).sort()).toEqual([
          'tape',
          'tape_au',
          'tape_bc',
          'tape_land_aweai',
        ]);
      });

      test("Should not return another farm's responses", async () => {
        const otherFarm = await createUserFarmIds(1);
        await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z');
        await addSurveyResponse('tape_au', '2026-09-12T12:00:00.000Z', otherFarm);

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body.map(({ farm_id }) => farm_id)).toEqual([farm.farm_id]);
      });

      test('Should return the responses of several farms', async () => {
        const [secondFarm] = await mocks.farmFactory();
        await addUserToFarm(owner.user_id, secondFarm);
        await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z');
        await addSurveyResponse('tape', '2026-09-20T12:00:00.000Z', {
          farm_id: secondFarm.farm_id,
        });

        const res = await getRequest({
          query: { farm_ids: `${farm.farm_id},${secondFarm.farm_id}` },
        });
        expect(res.status).toBe(200);
        expect(res.body.map(({ farm_id }) => farm_id)).toEqual([farm.farm_id, secondFarm.farm_id]);
      });

      test('Should return every response of a retaken survey, oldest first', async () => {
        await addSurveyResponse('tape', '2026-10-01T12:00:00.000Z');
        await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z');

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual([
          '2026-09-10T12:00:00.000Z',
          '2026-10-01T12:00:00.000Z',
        ]);
      });
    });

    describe('Period', () => {
      beforeEach(async () => {
        await addSurveyResponse('tape', '2026-09-10T12:00:00.000Z');
        await addSurveyResponse('tape', '2026-10-01T12:00:00.000Z');
        await addSurveyResponse('tape', '2026-11-01T23:30:00.000Z');
        await addSurveyResponse('tape', '2026-11-02T00:30:00.000Z');
      });

      test('Should return all responses without date params', async () => {
        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual([
          '2026-09-10T12:00:00.000Z',
          '2026-10-01T12:00:00.000Z',
          '2026-11-01T23:30:00.000Z',
          '2026-11-02T00:30:00.000Z',
        ]);
      });

      test('Should include responses on date_from', async () => {
        const res = await getRequest({
          query: { farm_ids: farm.farm_id, date_from: '2026-10-01' },
        });
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual([
          '2026-10-01T12:00:00.000Z',
          '2026-11-01T23:30:00.000Z',
          '2026-11-02T00:30:00.000Z',
        ]);
      });

      test('Should include responses from the start of date_from in UTC', async () => {
        const res = await getRequest({
          query: { farm_ids: farm.farm_id, date_from: '2026-11-02' },
        });
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual(['2026-11-02T00:30:00.000Z']);
      });

      test('Should include responses up to the end of date_to in UTC', async () => {
        const res = await getRequest({ query: { farm_ids: farm.farm_id, date_to: '2026-11-01' } });
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual([
          '2026-09-10T12:00:00.000Z',
          '2026-10-01T12:00:00.000Z',
          '2026-11-01T23:30:00.000Z',
        ]);
      });

      test('Should leave out a retake after date_to and return the earlier response', async () => {
        const res = await getRequest({
          query: { farm_ids: farm.farm_id, date_from: '2026-09-01', date_to: '2026-09-30' },
        });
        expect(res.status).toBe(200);
        expect(createdAts(res.body)).toEqual(['2026-09-10T12:00:00.000Z']);
      });
    });

    describe('Validation', () => {
      test('Should return 400 when farm_ids is missing', async () => {
        const res = await getRequest({ query: {} });
        expect(res.status).toBe(400);
      });

      test('Should return 400 when farm_ids is repeated', async () => {
        const otherFarm = await createUserFarmIds(1);
        const res = await getRequest({
          query: `farm_ids=${farm.farm_id}&farm_ids=${otherFarm.farm_id}`,
        });
        expect(res.status).toBe(400);
      });

      test('Should return 400 when a farm id is not a uuid', async () => {
        const res = await getRequest({ query: { farm_ids: `${farm.farm_id},not-a-uuid` } });
        expect(res.status).toBe(400);
      });

      test('Should return 400 when a date is malformed', async () => {
        const res = await getRequest({ query: { farm_ids: farm.farm_id, date_from: '2026-4-1' } });
        expect(res.status).toBe(400);
      });
    });
  });
});
