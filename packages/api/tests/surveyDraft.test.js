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
import { faker } from '@faker-js/faker';
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

describe('Survey draft endpoint tests', () => {
  let owner;
  let farm;
  let _ownerFarm;

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  function draftPath(survey_key = 'tape') {
    return `/survey_drafts/${survey_key}`;
  }

  async function getDraftRequest({
    user_id = owner.user_id,
    farm_id = farm.farm_id,
    survey_key = 'tape',
  } = {}) {
    return chai
      .request(server)
      .get(draftPath(survey_key))
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function putRequest(
    survey_data,
    { user_id = owner.user_id, farm_id = farm.farm_id, survey_key = 'tape' } = {},
    { survey_version = 'v1', current_page_no = 0, submission_id } = {},
  ) {
    return chai
      .request(server)
      .put(draftPath(survey_key))
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send({ farm_id, survey_version, survey_data, current_page_no, submission_id });
  }

  async function getDraftsRequest({ user_id = owner.user_id, farm_id = farm.farm_id } = {}) {
    return chai
      .request(server)
      .get('/survey_drafts')
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  async function postSurveyResponse(survey_key = 'tape') {
    return chai
      .request(server)
      .post('/survey_response')
      .set('Content-Type', 'application/json')
      .set('user_id', owner.user_id)
      .set('farm_id', farm.farm_id)
      .send({
        farm_id: farm.farm_id,
        survey_key,
        survey_response: { survey_version: 'v1', project_id: 'project-1', survey_step: 'step-1' },
      });
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

  describe('GET /survey_drafts/:survey_key', () => {
    test('Admin roles should be able to get a draft', async () => {
      const adminRoles = [1, 2, 5];
      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        await mocks.survey_draftFactory(
          { promisedUserFarm: [userFarmIds] },
          mocks.fakeSurveyDraft({ survey_data: { q1: 'answer' } }),
        );

        const res = await getDraftRequest(userFarmIds);
        expect(res.status).toBe(200);
        expect(res.body.survey_data).toEqual({ q1: 'answer' });
      }
    });

    test('Should return no content when no draft exists', async () => {
      const res = await getDraftRequest();
      expect(res.status).toBe(200);
      expect(res.body?.survey_data).toBeUndefined();
    });

    test('Should return the live draft for the farm for a given survey_key', async () => {
      const surveyKey = faker.lorem.word();
      await mocks.survey_draftFactory(
        { promisedUserFarm: [{ farm_id: farm.farm_id, user_id: owner.user_id }] },
        mocks.fakeSurveyDraft({ survey_key: surveyKey, survey_data: { q1: 'answer' } }),
      );
      const res = await getDraftRequest({ survey_key: surveyKey });
      expect(res.status).toBe(200);
      expect(res.body.survey_data).toEqual({ q1: 'answer' });
    });

    test('Should not return another farm draft', async () => {
      const otherFarm = await createUserFarmIds(1);
      await mocks.survey_draftFactory(
        { promisedUserFarm: [otherFarm] },
        mocks.fakeSurveyDraft({ survey_data: { q1: 'answer' } }),
      );

      const res = await getDraftRequest();
      expect(res.status).toBe(200);
      expect(res.body?.survey_data).toBeUndefined();
    });

    test('Worker should not be able to get a draft', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await getDraftRequest(userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await getDraftRequest({ farm_id: idsA.farm_id, user_id: idsB.user_id });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /survey_drafts', () => {
    test('Should return an empty result when the farm has no drafts', async () => {
      const res = await getDraftsRequest();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    test('Should return one entry per survey_key the farm has a live draft for', async () => {
      const promisedUserFarm = [{ farm_id: farm.farm_id, user_id: owner.user_id }];
      await mocks.survey_draftFactory(
        { promisedUserFarm },
        mocks.fakeSurveyDraft({ survey_key: 'tape', current_page_no: 7 }),
      );
      await mocks.survey_draftFactory(
        { promisedUserFarm },
        mocks.fakeSurveyDraft({ survey_key: 'tape_economic', current_page_no: 2 }),
      );

      const res = await getDraftsRequest();
      expect(res.status).toBe(200);
      expect(Object.keys(res.body).sort()).toEqual(['tape', 'tape_economic']);
      expect(res.body.tape.current_page_no).toBe(7);
      expect(res.body.tape_economic.current_page_no).toBe(2);
    });

    test('Should return created_at and leave out survey_data', async () => {
      await mocks.survey_draftFactory(
        { promisedUserFarm: [{ farm_id: farm.farm_id, user_id: owner.user_id }] },
        mocks.fakeSurveyDraft({ survey_key: 'tape' }),
      );

      const res = await getDraftsRequest();
      expect(res.status).toBe(200);
      expect(res.body.tape.created_at).toBeDefined();
      expect(res.body.tape.survey_data).toBeUndefined();
    });

    test('Should not return a soft-deleted draft', async () => {
      await mocks.survey_draftFactory(
        { promisedUserFarm: [{ farm_id: farm.farm_id, user_id: owner.user_id }] },
        mocks.fakeSurveyDraft({ survey_key: 'tape' }),
      );
      await postSurveyResponse('tape');

      const res = await getDraftsRequest();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    test("Should not return another farm's drafts", async () => {
      const otherFarm = await createUserFarmIds(1);
      await mocks.survey_draftFactory(
        { promisedUserFarm: [otherFarm] },
        mocks.fakeSurveyDraft({ survey_key: 'tape' }),
      );

      const res = await getDraftsRequest();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });

    test('Worker should not be able to get the drafts', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await getDraftsRequest(userFarmIds);
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /survey_drafts/:survey_key', () => {
    test('Admin roles should be able to create a draft', async () => {
      const adminRoles = [1, 2, 5];
      for (const role of adminRoles) {
        const userFarmIds = await createUserFarmIds(role);
        const res = await putRequest({ q1: 'answer' }, userFarmIds);

        expect(res.status).toBe(201);
        expect(res.body.survey_data).toEqual({ q1: 'answer' });
        expect(res.body.submission_id).toBeTruthy();
        expect(res.body.updated_at).toBeTruthy();
      }
    });

    test('Worker should not be able to save a draft', async () => {
      const userFarmIds = await createUserFarmIds(3);
      const res = await putRequest({ q1: 'answer' }, userFarmIds);
      expect(res.status).toBe(403);
    });

    test('Should return 403 if user is not part of the farm', async () => {
      const idsA = await createUserFarmIds(1);
      const idsB = await createUserFarmIds(1);
      const res = await putRequest(
        { q1: 'answer' },
        { farm_id: idsA.farm_id, user_id: idsB.user_id },
      );
      expect(res.status).toBe(403);
    });

    test('Saving again for the same key updates the existing draft rather than creating a new one', async () => {
      const first = await putRequest({ q1: 'first' }, {}, { current_page_no: 0 });
      expect(first.status).toBe(201);

      const second = await putRequest({ q1: 'second' }, {}, { current_page_no: 1 });
      expect(second.status).toBe(200);
      expect(second.body.id).toBe(first.body.id);
      expect(second.body.submission_id).toBe(first.body.submission_id);
      expect(second.body.survey_data).toEqual({ q1: 'second' });

      const rows = await knex('survey_draft').where({ farm_id: farm.farm_id });
      expect(rows.length).toBe(1);
    });

    describe('Draft writes after survey completion', () => {
      test('A draft write is rejected once its submission_id has already been completed', async () => {
        await postSurveyResponse();
        const { submission_id } = await knex('survey_response')
          .where({ farm_id: farm.farm_id, survey_key: 'tape' })
          .first();

        const res = await putRequest({ q1: 'too late' }, {}, { submission_id });
        expect(res.status).toBe(409);

        const rows = await knex('survey_draft').where({ farm_id: farm.farm_id });
        expect(rows.length).toBe(0);
      });

      // TODO: LF-5192 Delete once we support retake/update
      test('A draft write is rejected regardless of which submission_id is sent, once the survey is completed', async () => {
        await postSurveyResponse();
        const unrelatedId = '11111111-1111-1111-1111-111111111111';

        const res = await putRequest({ q1: 'too late' }, {}, { submission_id: unrelatedId });
        expect(res.status).toBe(409);
      });

      // TODO: LF-5192 Enable
      xtest('A draft write is unaffected by a completed survey under a different submission_id', async () => {
        await postSurveyResponse();
        const unrelatedId = '11111111-1111-1111-1111-111111111111';

        const res = await putRequest({ q1: 'answer' }, {}, { submission_id: unrelatedId });
        expect(res.status).toBe(201);
      });
    });
  });

  describe('Draft cleanup on survey submission', () => {
    test('Submitting the survey soft-deletes the live draft and reuses its submission_id', async () => {
      const [draft] = await mocks.survey_draftFactory(
        { promisedUserFarm: [{ farm_id: farm.farm_id, user_id: owner.user_id }] },
        mocks.fakeSurveyDraft(),
      );

      await postSurveyResponse();

      const getRes = await getDraftRequest();
      expect(getRes.body?.survey_data).toBeUndefined();

      const draftRow = await knex('survey_draft').where({ id: draft.id }).first();
      expect(draftRow.deleted).toBe(true);

      const responseRow = await knex('survey_response')
        .where({ farm_id: farm.farm_id, survey_key: 'tape' })
        .first();
      expect(responseRow.submission_id).toBe(draft.submission_id);
    });

    test('Submitting without a prior draft still succeeds with a fresh submission_id', async () => {
      const res = await postSurveyResponse();
      expect(res.status).toBe(201);

      const responseRow = await knex('survey_response')
        .where({ farm_id: farm.farm_id, survey_key: 'tape' })
        .first();
      expect(responseRow.submission_id).toBeTruthy();
    });
  });
});
