/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (tapeSurvey.test.js) is part of LiteFarm.
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
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

import mocks from './mock.factories.js';
import { createUserFarmIds } from './utils/testDataSetup.js';

describe('TapeSurvey endpoint tests', () => {
  let owner;
  let farm;
  let _ownerFarm;

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai
      .request(server)
      .post('/tape_survey')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function getRequest({ user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai.request(server).get('/tape_survey').set('user_id', user_id).set('farm_id', farm_id);
  }

  async function patchRequest(
    submission_id,
    data,
    { user_id = owner.user_id, farm_id = farm.farm_id } = {},
  ) {
    return chai
      .request(server)
      .patch(`/tape_survey/${submission_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function fakeTapeSurveyPayload(farm_id) {
    return {
      farm_id,
      survey_response: {
        survey_version: 'v1',
        project_id: 'project-1',
        survey_step: 'step-1',
      },
    };
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [_ownerFarm] = await mocks.userFarmFactory(
      { promisedUser: [owner], promisedFarm: [farm] },
      fakeUserFarm(1),
    );
  });

  afterEach(async () => {
    await tableCleanup(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('POST /tape_survey', () => {
    test('Admin roles should be able to create a tape survey', async () => {
      const adminRoles = [1, 2, 5];
      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await postRequest(fakeTapeSurveyPayload(userFarmIds.farm_id), userFarmIds);

        expect(res.status).toBe(201);
        const getRes = await getRequest(userFarmIds);
        expect(getRes.status).toBe(200);
        expect(getRes.body?.survey_response?.survey_step).toBe('step-1');
      }
    });

    test('Worker should not be able to create a tape survey', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await postRequest(fakeTapeSurveyPayload(userFarmIds.farm_id), userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await postRequest(fakeTapeSurveyPayload(idsA.farm_id), {
        farm_id: idsA.farm_id,
        user_id: idsB.user_id,
      });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /tape_survey', () => {
    test('Should return 404 when none exist', async () => {
      const res = await getRequest();
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Tape survey not found');
    });

    test('Should return the most recent tape survey', async () => {
      await postRequest(fakeTapeSurveyPayload(farm.farm_id));
      await postRequest({
        ...fakeTapeSurveyPayload(farm.farm_id),
        survey_response: {
          survey_version: 'v2',
          project_id: 'project-2',
          survey_step: 'step-2',
        },
      });

      const res = await getRequest();
      expect(res.status).toBe(200);
      expect(res.body?.survey_response?.survey_step).toBe('step-2');
    });

    test('Worker should not be able to get tape survey', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await getRequest(userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await getRequest({ farm_id: idsA.farm_id, user_id: idsB.user_id });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /tape_survey/:submission_id', () => {
    test('Should insert a new record with same submission_id', async () => {
      await postRequest(fakeTapeSurveyPayload(farm.farm_id));

      const created = await getRequest();
      const submission_id = created.body.submission_id;

      const patchRes = await patchRequest(submission_id, {
        farm_id: farm.farm_id,
        survey_response: {
          survey_version: 'v3',
          project_id: 'project-3',
          survey_step: 'step-3',
        },
      });
      expect(patchRes.status).toBe(204);

      const latest = await getRequest();
      expect(latest.status).toBe(200);
      expect(latest.body?.survey_response?.survey_step).toBe('step-3');
    });

    test('Worker should not be able to patch a tape survey', async () => {
      const userFarmIds = await createUserFarmIds(3);
      await postRequest(fakeTapeSurveyPayload(userFarmIds.farm_id), userFarmIds);
      const created = await getRequest(userFarmIds);
      const submission_id = created.body.submission_id;

      const res = await patchRequest(
        submission_id,
        {
          survey_response: { survey_version: 'v3', project_id: 'project-3', survey_step: 'step-3' },
        },
        userFarmIds,
      );
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      await postRequest(fakeTapeSurveyPayload(idsA.farm_id), idsA);
      const created = await getRequest(idsA);
      const submission_id = created.body.submission_id;

      const res = await patchRequest(
        submission_id,
        {
          survey_response: { survey_version: 'v3', project_id: 'project-3', survey_step: 'step-3' },
        },
        { farm_id: idsA.farm_id, user_id: idsB.user_id },
      );
      expect(res.status).toBe(403);
    });
  });
});
