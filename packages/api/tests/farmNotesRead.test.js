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

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import { createUserFarmIds } from './utils/testDataSetup.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

const setFarmNoteRead = async ({ farm_id, user_id }) => {
  return await knex('farm_notes_read')
    .insert({ user_id, farm_id, last_read_at: new Date().toISOString() })
    .onConflict(['user_id', 'farm_id'])
    .merge();
};

async function getRequest({ user_id, farm_id }) {
  return chai
    .request(server)
    .get('/farm_notes_read')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

async function patchRequest({ user_id, farm_id }) {
  return chai
    .request(server)
    .patch('/farm_notes_read')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

describe('Farm Notes Read tests', () => {
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET /farm_notes_read', () => {
    test.each([1, 2, 3, 5])(
      'Returns { last_read_at: null } when no record exists (role %i)',
      async (role) => {
        const userFarmIds = await createUserFarmIds(role);

        const res = await getRequest(userFarmIds);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ last_read_at: null });
      },
    );

    test.each([1, 2, 3, 5])(
      'Returns { last_read_at: <timestamp> } after mark-read (role %i)',
      async (role) => {
        const userFarmIds = await createUserFarmIds(role);
        await setFarmNoteRead(userFarmIds);

        const res = await getRequest(userFarmIds);
        expect(res.status).toBe(200);
        expect(res.body.last_read_at).not.toBeNull();
        expect(typeof res.body.last_read_at).toBe('string');
      },
    );

    test('Returns 403 for user on a different farm', async () => {
      const { user_id } = await createUserFarmIds(1);
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await getRequest({ user_id, farm_id: other_farm_id });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /farm_notes_read', () => {
    test.each([1, 2, 3, 5])(
      'Creates a row when none exists and sets last_read_at (role %i)',
      async (role) => {
        const userFarmIds = await createUserFarmIds(role);

        const res = await patchRequest(userFarmIds);
        expect(res.status).toBe(204);

        const row = await knex('farm_notes_read').where(userFarmIds).first();
        expect(row).toBeDefined();
        expect(row.last_read_at).toBeDefined();
      },
    );

    test.each([1, 2, 3, 5])(
      'Updates last_read_at when a row already exists (role %i)',
      async (role) => {
        const userFarmIds = await createUserFarmIds(role);

        // First mark-read
        await patchRequest(userFarmIds);

        const first = await knex('farm_notes_read').where(userFarmIds).first();

        // Brief wait to ensure timestamp differs
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Second mark-read
        await patchRequest(userFarmIds);

        const second = await knex('farm_notes_read').where(userFarmIds).first();

        expect(new Date(second.last_read_at).getTime()).toBeGreaterThanOrEqual(
          new Date(first.last_read_at).getTime(),
        );
      },
    );

    test('Returns 403 for user on a different farm', async () => {
      const { user_id } = await createUserFarmIds(1);
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await patchRequest({ user_id, farm_id: other_farm_id });
      expect(res.status).toBe(403);
    });
  });
});
