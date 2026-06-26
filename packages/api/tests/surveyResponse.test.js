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

describe('Survey response endpoint tests', () => {
  let owner;
  let farm;
  let _ownerFarm;

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai
      .request(server)
      .post('/survey_response')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function getRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    survey_key = 'tape',
  } = {}) {
    return chai
      .request(server)
      .get('/survey_response')
      .query({ survey_key })
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function patchRequest(
    submission_id,
    survey_response,
    { user_id = owner.user_id, farm_id = farm.farm_id } = {},
  ) {
    return chai
      .request(server)
      .patch(`/survey_response/${submission_id}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({ survey_response });
  }

  function fakeSurveyPayload(farm_id, survey_key = 'tape') {
    return {
      farm_id,
      survey_key,
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

  describe('POST /survey_response', () => {
    test('Admin roles should be able to create a survey response', async () => {
      const adminRoles = [1, 2, 5];
      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await postRequest(fakeSurveyPayload(userFarmIds.farm_id), userFarmIds);

        expect(res.status).toBe(201);
        const getRes = await getRequest(userFarmIds);
        expect(getRes.status).toBe(200);
        expect(getRes.body?.survey_response?.survey_step).toBe('step-1');
      }
    });

    test('Worker should not be able to create a survey response', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await postRequest(fakeSurveyPayload(userFarmIds.farm_id), userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await postRequest(fakeSurveyPayload(idsA.farm_id), {
        farm_id: idsA.farm_id,
        user_id: idsB.user_id,
      });
      expect(res.status).toBe(403);
    });

    test('Should return 400 when survey_key is missing', async () => {
      const { survey_key: _omitted, ...payloadWithoutKey } = fakeSurveyPayload(farm.farm_id);
      const res = await postRequest(payloadWithoutKey);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /survey_response', () => {
    test('Should return 200 with no survey response when none exist', async () => {
      const res = await getRequest();
      expect(res.status).toBe(200);
      expect(res.body?.survey_response).toBeUndefined();
    });

    test('Should return the most recent survey response of the requested kind', async () => {
      await postRequest(fakeSurveyPayload(farm.farm_id));
      await postRequest({
        ...fakeSurveyPayload(farm.farm_id),
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

    test('Should not return another survey kind for the farm', async () => {
      await postRequest(fakeSurveyPayload(farm.farm_id, 'tape'));
      const res = await getRequest({ survey_key: 'some_other_survey' });
      expect(res.status).toBe(200);
      expect(res.body?.survey_response).toBeUndefined();
    });

    test('Should return 400 when survey_key is missing', async () => {
      const res = await chai
        .request(server)
        .get('/survey_response')
        .set('user_id', owner.user_id)
        .set('farm_id', farm.farm_id);
      expect(res.status).toBe(400);
    });

    test('Worker should not be able to get a survey response', async () => {
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

  describe('PATCH /survey_response/:submission_id', () => {
    // Creates a survey response, then returns the submission_id the API assigned it.
    async function createSubmission(farm_id = farm.farm_id, survey_key = 'tape') {
      await postRequest(fakeSurveyPayload(farm_id, survey_key), { farm_id });
      const getRes = await getRequest({ farm_id, survey_key });
      return getRes.body.submission_id;
    }

    test('Update appends a new version and leaves the earlier one in place', async () => {
      const submission_id = await createSubmission();

      const res = await patchRequest(submission_id, {
        survey_version: 'v2',
        project_id: 'project-2',
        survey_step: 'step-2',
      });
      expect(res.status).toBe(204);

      // getLatestSurveyResponse returns the new version.
      const getRes = await getRequest();
      expect(getRes.status).toBe(200);
      expect(getRes.body?.survey_response?.survey_step).toBe('step-2');

      // Both versions are retained under the one submission_id; nothing was overwritten.
      const rows = await knex('survey_response').where({ submission_id }).orderBy('id');
      expect(rows.length).toBe(2);
      expect(rows[0].survey_response.survey_step).toBe('step-1');
      expect(rows[1].survey_response.survey_step).toBe('step-2');
    });

    test('Update reuses the existing survey_key rather than the request body', async () => {
      const submission_id = await createSubmission(farm.farm_id, 'tape');

      await patchRequest(submission_id, {
        survey_version: 'v2',
        project_id: 'project-2',
        survey_step: 'step-2',
      });

      const rows = await knex('survey_response').where({ submission_id });
      expect(rows.every((row) => row.survey_key === 'tape')).toBe(true);
    });

    test('Should return 403 for an unknown submission_id', async () => {
      // hasFarmAccess finds no row for the submission_id and rejects before the controller runs
      const res = await patchRequest('00000000-0000-0000-0000-000000000000', {
        survey_version: 'v2',
        project_id: 'project-2',
        survey_step: 'step-2',
      });
      expect(res.status).toBe(403);
    });

    test('Worker should not be able to update a survey response', async () => {
      const submission_id = await createSubmission();
      const worker = await createUserFarmIds(3);
      const res = await patchRequest(
        submission_id,
        { survey_version: 'v2', project_id: 'project-2', survey_step: 'step-2' },
        worker,
      );
      expect(res.status).toBe(403);
    });

    test('Should return 403 when the submission belongs to another farm', async () => {
      const submission_id = await createSubmission();
      const otherOwner = await createUserFarmIds(1);
      const res = await patchRequest(
        submission_id,
        { survey_version: 'v2', project_id: 'project-2', survey_step: 'step-2' },
        otherOwner,
      );
      expect(res.status).toBe(403);
    });
  });
});
