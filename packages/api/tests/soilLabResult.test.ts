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
import { createToken, tokenType } from '../src/util/jwt.js';
import { Farm, Location, User } from '../src/models/types.js';

jest.mock('jsdom');
jest.mock('../src/jobs/station_sync/mapping.js');

const PATH = '/dashboard/soil_lab_results';

type SoilLabResultResponse = Omit<Response, 'body'> & {
  body: Record<string, unknown>[];
};

const saveToken = (user_id: string) =>
  createToken('soilLabResult', { user_id, aud: 'soil_lab_result' });

describe('Soil lab result routes', () => {
  let owner: User;
  let removedMember: User;
  let outsider: User;
  let farm: Farm;
  let otherFarm: Farm;
  let location: Location;
  let otherFarmLocation: Location;

  const send = (
    method: 'get' | 'post' | 'put',
    path: string,
    { token, farm_id = farm.farm_id }: { token?: string; farm_id?: string } = {},
  ): Promise<SoilLabResultResponse> => {
    let request = chai.request(server)[method](path).set('farm_id', farm_id);
    if (token) {
      request = request.set('Authorization', `Bearer ${token}`);
    }
    return request as unknown as Promise<SoilLabResultResponse>;
  };

  const getResults = (user: User = owner, farm_id = farm.farm_id) =>
    send('get', PATH, { token: saveToken(user.user_id), farm_id });

  const seedRow = async (overrides: Record<string, unknown> = {}) => {
    const [row] = await knex('soil_lab_result')
      .insert({
        farm_id: farm.farm_id,
        submission_id: randomUUID(),
        row: 2,
        location_id: location.location_id,
        match_method: 'inside',
        sample_label: 'N-01',
        sampled_on: '2026-04-18',
        depth_top_cm: 0,
        depth_bottom_cm: 15,
        depth_assumed: false,
        lat: 49.261234,
        lng: -123.248765,
        values: { ph: 6.4, clay: 23, phosphorus: 42 },
        lab_name: 'Test Lab',
        source_filename: 'results.csv',
        source_sha256: 'abc123',
        created_by_user_id: owner.user_id,
        updated_by_user_id: owner.user_id,
        ...overrides,
      })
      .returning('*');
    return row;
  };

  beforeAll(async () => {
    [farm] = await mocks.farmFactory();
    [otherFarm] = await mocks.farmFactory();
    [owner] = await mocks.usersFactory();
    [removedMember] = await mocks.usersFactory();
    [outsider] = await mocks.usersFactory();

    await mocks.userFarmFactory(
      { promisedUser: Promise.resolve([owner]), promisedFarm: Promise.resolve([farm]) },
      mocks.fakeUserFarm({ role_id: 1 }),
    );
    await mocks.userFarmFactory(
      { promisedUser: Promise.resolve([removedMember]), promisedFarm: Promise.resolve([farm]) },
      mocks.fakeUserFarm({ role_id: 1, status: 'Inactive' }),
    );
    await mocks.userFarmFactory(
      { promisedUser: Promise.resolve([outsider]), promisedFarm: Promise.resolve([otherFarm]) },
      mocks.fakeUserFarm({ role_id: 1 }),
    );

    [location] = await mocks.locationFactory({ promisedFarm: Promise.resolve([farm]) });
    [otherFarmLocation] = await mocks.locationFactory({
      promisedFarm: Promise.resolve([otherFarm]),
    });
  });

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('Tokens', () => {
    test('refuses a request with no token', async () => {
      const res = await send('get', PATH);
      expect(res.status).toBe(401);
    });

    test('refuses an expired save token', async () => {
      const token = jwt.sign(
        {
          user_id: owner.user_id,
          aud: 'soil_lab_result',
          exp: Math.floor(Date.now() / 1000) - 60,
        },
        tokenType.soilLabResult!,
        { algorithm: 'HS256' },
      );
      const res = await send('get', PATH, { token });
      expect(res.status).toBe(401);
    });

    test('refuses a token signed with another secret', async () => {
      const token = jwt.sign(
        { user_id: owner.user_id, aud: 'soil_lab_result' },
        'not-the-dashboard-api-secret',
        { algorithm: 'HS256', expiresIn: '8h' },
      );
      const res = await send('get', PATH, { token });
      expect(res.status).toBe(401);
    });

    test('refuses a token with the right secret but no aud', async () => {
      const token = jwt.sign({ user_id: owner.user_id }, tokenType.soilLabResult!, {
        algorithm: 'HS256',
        expiresIn: '8h',
      });
      const res = await send('get', PATH, { token });
      expect(res.status).toBe(401);
    });

    test('refuses a token with the right secret but another aud', async () => {
      const token = jwt.sign(
        { user_id: owner.user_id, aud: 'another_dashboard_feature' },
        tokenType.soilLabResult!,
        { algorithm: 'HS256', expiresIn: '8h' },
      );
      const res = await send('get', PATH, { token });
      expect(res.status).toBe(401);
    });

    test('refuses the LiteFarm access token', async () => {
      const token = createToken('access', { user_id: owner.user_id });
      const res = await send('get', PATH, { token });
      expect(res.status).toBe(401);
    });

    test('the save token is refused on an ordinary route', async () => {
      const res = await send('get', `/farm/${farm.farm_id}`, { token: saveToken(owner.user_id) });
      expect(res.status).toBe(401);
    });

    test('neighbouring paths still need the access token', async () => {
      const suffixed = await send('get', `${PATH}_x`);
      const nested = await send('get', `${PATH}/a/b`);
      expect(suffixed.status).toBe(401);
      expect(nested.status).toBe(401);
    });

    test('refuses every request when the secret is unset', async () => {
      const token = saveToken(owner.user_id);
      const secret = tokenType.soilLabResult;
      tokenType.soilLabResult = undefined;
      try {
        const res = await send('get', PATH, { token });
        expect(res.status).toBe(401);
      } finally {
        tokenType.soilLabResult = secret;
      }
    });
  });

  describe('Membership', () => {
    test('refuses a user who is not a member of the farm', async () => {
      const res = await getResults(outsider);
      expect(res.status).toBe(403);
    });

    test('refuses a removed member', async () => {
      const res = await getResults(removedMember);
      expect(res.status).toBe(403);
    });
  });

  describe('GET', () => {
    test("returns only the header farm's live rows, with numbers as numbers", async () => {
      const kept = await seedRow();
      const replacedSubmissionId = randomUUID();
      await seedRow({ submission_id: replacedSubmissionId, deleted: true });
      await seedRow({ submission_id: replacedSubmissionId, row: 9 });
      const otherFarmRow = await seedRow({
        farm_id: otherFarm.farm_id,
        location_id: otherFarmLocation.location_id,
      });

      const res = await getResults();
      expect(res.status).toBe(200);
      const rows = res.body;

      expect(rows.every((row) => row.farm_id === farm.farm_id)).toBe(true);
      expect(rows.some((row) => row.submission_id === otherFarmRow.submission_id)).toBe(false);
      expect(
        rows.filter((row) => row.submission_id === replacedSubmissionId).map((row) => row.row),
      ).toEqual([9]);

      expect(rows.find((row) => row.id === kept.id)).toEqual({
        id: kept.id,
        farm_id: farm.farm_id,
        submission_id: kept.submission_id,
        row: 2,
        location_id: location.location_id,
        match_method: 'inside',
        sample_label: 'N-01',
        sampled_on: '2026-04-18',
        depth_top_cm: 0,
        depth_bottom_cm: 15,
        depth_assumed: false,
        lat: 49.261234,
        lng: -123.248765,
        values: { ph: 6.4, clay: 23, phosphorus: 42 },
        lab_name: 'Test Lab',
        source_filename: 'results.csv',
        source_sha256: 'abc123',
      });
    });
  });
});
