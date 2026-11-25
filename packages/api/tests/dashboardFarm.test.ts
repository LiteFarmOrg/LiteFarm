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
import { Farm, User, UserFarm } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/jobs/station_sync/mapping.js');

import mocks from './mock.factories.js';
import { addUserToFarm, createUserFarmIds, fakeUserFarm } from './utils/testDataSetup.js';

interface DashboardFarm {
  farm_id: Farm['farm_id'];
  farm_name: Farm['farm_name'];
  role_id: UserFarm['role_id'];
  tape_project_ids: string[];
}

type DashboardFarmResponse = Omit<Response, 'body'> & {
  body: DashboardFarm[] & { error?: string };
};

describe('Dashboard farm endpoint tests', () => {
  let owner: User;
  let farm: Farm;

  function tapeToken(userId: User['user_id']) {
    return createToken('dashboardApi', { user_id: userId, aud: 'tape' });
  }

  async function getRequest({
    user_id = owner.user_id,
    token = tapeToken(user_id),
    path = '/dashboard/farms',
  }: {
    user_id?: User['user_id'];
    token?: string;
    path?: string;
  } = {}): Promise<DashboardFarmResponse> {
    return chai
      .request(server)
      .get(path)
      .set('Authorization', `Bearer ${token}`) as unknown as Promise<DashboardFarmResponse>;
  }

  async function addSurveyResponse(
    survey_key: string,
    project_id: string,
    { farm_id = farm.farm_id, user_id = owner.user_id } = {},
  ) {
    return mocks.survey_responseFactory(
      { promisedUserFarm: Promise.resolve([{ farm_id, user_id }]) },
      mocks.fakeSurveyResponse({ survey_key, project_id }),
    );
  }

  function farmIds(farms: DashboardFarm[]) {
    return farms.map(({ farm_id }) => farm_id);
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

  describe('GET /dashboard/farms', () => {
    describe('Tokens', () => {
      test('Should return 401 for a token with a random audience', async () => {
        const token = createToken('dashboardApi', {
          user_id: owner.user_id,
          aud: 'random_audience',
        });
        const res = await getRequest({ token });
        expect(res.status).toBe(401);
      });

      test('Should accept the TAPE token only on the exact path', async () => {
        const route = await getRequest();
        const suffixed = await getRequest({ path: '/dashboard/farms_x' });
        const nested = await getRequest({ path: '/dashboard/farms/x' });
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

      test('All roles should be able to get their farms', async () => {
        const roles = [1, 2, 3, 5];
        for (const role of roles) {
          const userFarmIds = await createUserFarmIds(role);

          const res = await getRequest({ user_id: userFarmIds.user_id });
          expect(res.status).toBe(200);
          expect(res.body).toEqual([expect.objectContaining({ farm_id: userFarmIds.farm_id })]);
        }
      });

      test('Should return an empty list for a user with no farms', async () => {
        const [userWithoutFarms] = await mocks.usersFactory();
        const res = await getRequest({ user_id: userWithoutFarms.user_id });
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });

    describe('Farms', () => {
      test('Should return the farm id, name, role and TAPE project ids', async () => {
        await addSurveyResponse('tape', 'FAO');

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
          {
            farm_id: farm.farm_id,
            farm_name: farm.farm_name,
            role_id: 1,
            tape_project_ids: ['FAO'],
          },
        ]);
      });

      test('Should return the farms ordered by farm name, ignoring case', async () => {
        const [farmA] = await mocks.farmFactory(mocks.fakeFarm({ farm_name: 'A farm' }));
        const [farmZ] = await mocks.farmFactory(mocks.fakeFarm({ farm_name: 'Z farm' }));
        await knex('farm').update({ farm_name: 'm farm' }).where({ farm_id: farm.farm_id });
        await addUserToFarm(owner.user_id, farmZ);
        await addUserToFarm(owner.user_id, farmA);

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(farmIds(res.body)).toEqual([farmA.farm_id, farm.farm_id, farmZ.farm_id]);
      });

      test("Should not return another user's farm", async () => {
        await createUserFarmIds(1);
        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(farmIds(res.body)).toEqual([farm.farm_id]);
      });

      test('Should not return a farm the user was removed from', async () => {
        const [removedFarm] = await mocks.farmFactory();
        await addUserToFarm(owner.user_id, removedFarm, { ...fakeUserFarm(1), status: 'Inactive' });

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(farmIds(res.body)).toEqual([farm.farm_id]);
      });

      test('Should not return a farm the user is only invited to', async () => {
        const [invitedFarm] = await mocks.farmFactory();
        await addUserToFarm(owner.user_id, invitedFarm, { ...fakeUserFarm(1), status: 'Invited' });

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(farmIds(res.body)).toEqual([farm.farm_id]);
      });

      test('Should not return a deleted farm', async () => {
        const [deletedFarm] = await mocks.farmFactory();
        await addUserToFarm(owner.user_id, deletedFarm);
        await knex('farm').update({ deleted: true }).where({ farm_id: deletedFarm.farm_id });

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(farmIds(res.body)).toEqual([farm.farm_id]);
      });
    });

    describe('TAPE project ids', () => {
      test('Should return an empty list for a farm with no surveys', async () => {
        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body[0].tape_project_ids).toEqual([]);
      });

      test('Should list each project id once', async () => {
        await addSurveyResponse('tape', 'FAO');
        await addSurveyResponse('tape', 'FAO');
        await addSurveyResponse('tape_land_aweai', 'FAO');
        await addSurveyResponse('tape_au', 'Mornington');

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body[0].tape_project_ids.sort()).toEqual(['FAO', 'Mornington']);
      });

      test('Should leave out the project ids of other surveys', async () => {
        await addSurveyResponse('cathi_gao', 'Cathi-Gao');
        await addSurveyResponse('tapex', 'NOT_TAPE');

        const res = await getRequest();
        expect(res.status).toBe(200);
        expect(res.body[0].tape_project_ids).toEqual([]);
      });

      test("Should not mix in another farm's project ids", async () => {
        const [secondFarm] = await mocks.farmFactory();
        await addUserToFarm(owner.user_id, secondFarm);
        await addSurveyResponse('tape', 'FAO');
        await addSurveyResponse('tape_bc', 'AG4C_BC', { farm_id: secondFarm.farm_id });

        const res = await getRequest();
        expect(res.status).toBe(200);
        const projectIdsByFarm = Object.fromEntries(
          res.body.map(({ farm_id, tape_project_ids }) => [farm_id, tape_project_ids]),
        );
        expect(projectIdsByFarm).toEqual({
          [farm.farm_id]: ['FAO'],
          [secondFarm.farm_id]: ['AG4C_BC'],
        });
      });
    });
  });
});
