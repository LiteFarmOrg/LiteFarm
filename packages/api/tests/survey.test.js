/*
 *  Copyright (C) 2026 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (survey.test.js) is part of LiteFarm.
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

describe('Survey endpoint tests', () => {
  let owner;
  let farm;
  let _ownerFarm;

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function postRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai
      .request(server)
      .post('/survey/response')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  async function getResponseRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    survey_key = 'tape',
  } = {}) {
    return chai
      .request(server)
      .get('/survey/response')
      .query({ survey_key })
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function getAvailableRequest({ user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai.request(server).get('/survey').set('user_id', user_id).set('farm_id', farm_id);
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

  describe('POST /survey/response', () => {
    test('Admin roles should be able to create a survey response', async () => {
      const adminRoles = [1, 2, 5];
      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await postRequest(fakeSurveyPayload(userFarmIds.farm_id), userFarmIds);

        expect(res.status).toBe(201);
        const getRes = await getResponseRequest(userFarmIds);
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

    test('Should return 400 for an unknown survey_key', async () => {
      const res = await postRequest(fakeSurveyPayload(farm.farm_id, 'not_a_real_survey'));
      expect(res.status).toBe(400);
    });
  });

  describe('GET /survey/response', () => {
    test('Should return 404 when none exist', async () => {
      const res = await getResponseRequest();
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Survey response not found');
    });

    test('Should return the most recent survey response', async () => {
      await postRequest(fakeSurveyPayload(farm.farm_id));
      await postRequest({
        ...fakeSurveyPayload(farm.farm_id),
        survey_response: {
          survey_version: 'v2',
          project_id: 'project-2',
          survey_step: 'step-2',
        },
      });

      const res = await getResponseRequest();
      expect(res.status).toBe(200);
      expect(res.body?.survey_response?.survey_step).toBe('step-2');
    });

    test('Worker should not be able to get a survey response', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await getResponseRequest(userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await getResponseRequest({ farm_id: idsA.farm_id, user_id: idsB.user_id });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /survey', () => {
    test('Should return the available surveys for the farm, including the global TAPE survey', async () => {
      const res = await getAvailableRequest();
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const tape = res.body.find((survey) => survey.key === 'tape');
      expect(tape).toBeDefined();
      expect(tape.cdnDirectory).toBe('tape_surveys');
      expect(typeof tape.version).toBe('string');
    });

    test('Worker should not be able to list available surveys', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await getAvailableRequest(userFarmIds);
      expect(res.status).toBe(403);
    });
  });
});
