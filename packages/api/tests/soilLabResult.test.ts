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

interface Sample {
  row: number;
  sample_label: string | null;
  location_id: string;
  match_method: string;
  sampled_on: string | null;
  depth_top_cm: number;
  depth_bottom_cm: number;
  depth_assumed: boolean;
  lat: number | null;
  lng: number | null;
  values: Record<string, unknown>;
}

interface Batch {
  submission_id: string;
  lab_name: string | null;
  source_filename: string;
  source_sha256: string;
  samples: Sample[];
}

interface BatchResponseBody {
  submission_id?: string;
  soil_lab_results?: { row: number; id: string }[];
  errors?: { row?: number; message: string }[];
}

type SoilLabResultResponse = Omit<Response, 'body'> & {
  body: BatchResponseBody & Record<string, unknown>[];
};

const saveToken = (user_id: string) =>
  createToken('soilLabResult', { user_id, aud: 'soil_lab_result' });

const utcDateFromToday = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

describe('Soil lab result routes', () => {
  let owner: User;
  let worker: User;
  let removedMember: User;
  let outsider: User;
  let farm: Farm;
  let otherFarm: Farm;
  let location: Location;
  let otherFarmLocation: Location;
  let deletedLocation: Location;

  const sample = (overrides: Partial<Sample> = {}): Sample => ({
    row: 2,
    sample_label: 'N-01',
    location_id: location.location_id,
    match_method: 'inside',
    sampled_on: '2026-04-18',
    depth_top_cm: 0,
    depth_bottom_cm: 15,
    depth_assumed: false,
    lat: 49.261234,
    lng: -123.248765,
    values: { ph: 6.4, clay: 23, phosphorus: 42 },
    ...overrides,
  });

  const batch = (overrides: Partial<Batch> = {}): Batch => ({
    submission_id: randomUUID(),
    lab_name: 'Test Lab',
    source_filename: 'results.csv',
    source_sha256: 'abc123',
    samples: [sample(), sample({ row: 3, sample_label: 'N-02' })],
    ...overrides,
  });

  const send = (
    method: 'get' | 'post' | 'put',
    path: string,
    {
      token,
      farm_id = farm.farm_id,
      body,
    }: { token?: string; farm_id?: string; body?: object | string } = {},
  ): Promise<SoilLabResultResponse> => {
    let request = chai.request(server)[method](path).set('farm_id', farm_id);
    if (token) {
      request = request.set('Authorization', `Bearer ${token}`);
    }
    if (body !== undefined) {
      request = request.set('content-type', 'application/json').send(body);
    }
    return request as unknown as Promise<SoilLabResultResponse>;
  };

  const getResults = (user: User = owner, farm_id = farm.farm_id) =>
    send('get', PATH, { token: saveToken(user.user_id), farm_id });

  const postBatch = (body: object | string, user: User = owner, farm_id = farm.farm_id) =>
    send('post', PATH, { token: saveToken(user.user_id), farm_id, body });

  const putBatch = (submission_id: string, body: object, user: User = owner) =>
    send('put', `${PATH}/${submission_id}`, { token: saveToken(user.user_id), body });

  const liveRowCount = async (submission_id: string) =>
    Number(
      (
        await knex('soil_lab_result')
          .where({ submission_id, deleted: false })
          .count('* as count')
          .first()
      )?.count,
    );

  const expectRowError = (res: SoilLabResultResponse, row: number) => {
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ row })]));
  };

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
    [worker] = await mocks.usersFactory();
    [removedMember] = await mocks.usersFactory();
    [outsider] = await mocks.usersFactory();

    await mocks.userFarmFactory(
      { promisedUser: Promise.resolve([owner]), promisedFarm: Promise.resolve([farm]) },
      mocks.fakeUserFarm({ role_id: 1 }),
    );
    await mocks.userFarmFactory(
      { promisedUser: Promise.resolve([worker]), promisedFarm: Promise.resolve([farm]) },
      mocks.fakeUserFarm({ role_id: 3 }),
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
    [deletedLocation] = await mocks.locationFactory({ promisedFarm: Promise.resolve([farm]) });
    await knex('location')
      .update({ deleted: true })
      .where({ location_id: deletedLocation.location_id });
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
      const getRes = await send('get', PATH, { token });
      const postRes = await send('post', PATH, { token, body: batch() });
      expect(getRes.status).toBe(401);
      expect(postRes.status).toBe(401);
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
    test('a worker can save', async () => {
      const res = await postBatch(batch(), worker);
      expect(res.status).toBe(201);
    });

    test('refuses a user who is not a member of the farm', async () => {
      const getRes = await getResults(outsider);
      const postRes = await postBatch(batch(), outsider);
      expect(getRes.status).toBe(403);
      expect(postRes.status).toBe(403);
    });

    test('refuses a removed member', async () => {
      const getRes = await getResults(removedMember);
      const postRes = await postBatch(batch(), removedMember);
      expect(getRes.status).toBe(403);
      expect(postRes.status).toBe(403);
    });
  });

  describe('POST', () => {
    test('saves a batch and returns the row and id pairs', async () => {
      const body = batch();
      const res = await postBatch(body);

      expect(res.status).toBe(201);
      expect(res.body.submission_id).toBe(body.submission_id);
      expect(res.body.soil_lab_results).toEqual([
        { row: 2, id: expect.any(String) },
        { row: 3, id: expect.any(String) },
      ]);

      const stored = await knex('soil_lab_result').where({ submission_id: body.submission_id });
      expect(stored).toHaveLength(2);
      for (const row of stored) {
        expect(row.farm_id).toBe(farm.farm_id);
        expect(row.created_by_user_id).toBe(owner.user_id);
      }
    });

    test('a retry with the same submission_id returns the stored batch and inserts nothing', async () => {
      const body = batch();
      const first = await postBatch(body);
      const retry = await postBatch(body);

      expect(first.status).toBe(201);
      expect(retry.status).toBe(200);
      expect(retry.body).toEqual(first.body);
      expect(await liveRowCount(body.submission_id)).toBe(2);
    });

    test('two POSTs with one submission_id sent at once store one batch', async () => {
      const body = batch();
      const [a, b] = await Promise.all([postBatch(body), postBatch(body)]);

      expect([a.status, b.status].sort()).toEqual([200, 201]);
      expect(a.body.soil_lab_results).toEqual(b.body.soil_lab_results);
      expect(await liveRowCount(body.submission_id)).toBe(2);
    });

    test('refuses a submission_id stored on another farm with 409', async () => {
      const otherFarmBatch = batch({
        samples: [sample({ location_id: otherFarmLocation.location_id })],
      });
      const stored = await postBatch(otherFarmBatch, outsider, otherFarm.farm_id);
      expect(stored.status).toBe(201);

      const res = await postBatch({ ...batch(), submission_id: otherFarmBatch.submission_id });
      expect(res.status).toBe(409);
      expect(res.body.soil_lab_results).toBeUndefined();
    });

    test("refuses another farm's location", async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 5, location_id: otherFarmLocation.location_id })] }),
      );
      expectRowError(res, 5);
    });

    test('refuses a deleted location', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 6, location_id: deletedLocation.location_id })] }),
      );
      expectRowError(res, 6);
    });

    test('refuses a location_id that is not a uuid', async () => {
      const res = await postBatch(batch({ samples: [sample({ row: 7, location_id: 'north' })] }));
      expectRowError(res, 7);
    });

    test('refuses a depth_top_cm that is not less than depth_bottom_cm', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 8, depth_top_cm: 15, depth_bottom_cm: 15 })] }),
      );
      expectRowError(res, 8);
    });

    test('refuses a sampled_on two days ahead', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 9, sampled_on: utcDateFromToday(2) })] }),
      );
      expectRowError(res, 9);
    });

    test('accepts a sampled_on one day ahead', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ sampled_on: utcDateFromToday(1) })] }),
      );
      expect(res.status).toBe(201);
    });

    test('refuses a sampled_on that is not an ISO date', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 10, sampled_on: '18/04/2026' })] }),
      );
      expectRowError(res, 10);
    });

    test('refuses empty values', async () => {
      const res = await postBatch(batch({ samples: [sample({ row: 11, values: {} })] }));
      expectRowError(res, 11);
    });

    test('refuses a value of 1e400', async () => {
      const body = JSON.stringify(
        batch({ samples: [sample({ row: 12, values: { ph: '__INFINITY__' } })] }),
      ).replace('"__INFINITY__"', '1e400');
      const res = await postBatch(body);
      expectRowError(res, 12);
    });

    test('refuses a text value', async () => {
      const res = await postBatch(batch({ samples: [sample({ row: 13, values: { ph: '6.4' } })] }));
      expectRowError(res, 13);
    });

    test('refuses a values key over 64 characters', async () => {
      const res = await postBatch(
        batch({ samples: [sample({ row: 14, values: { ['k'.repeat(65)]: 1 } })] }),
      );
      expectRowError(res, 14);
    });

    test('refuses a row number used twice in one batch', async () => {
      const res = await postBatch(batch({ samples: [sample({ row: 15 }), sample({ row: 15 })] }));
      expectRowError(res, 15);
    });

    test('refuses a sample without an integer row, by its index', async () => {
      const res = await postBatch({
        ...batch(),
        samples: [sample(), null, { ...sample(), row: '4' }],
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { message: 'samples[1] must have an integer row' },
        { message: 'samples[2] must have an integer row' },
      ]);
    });

    test('refuses a batch with no samples', async () => {
      const res = await postBatch(batch({ samples: [] }));
      expect(res.status).toBe(400);
    });

    describe('Batch size', () => {
      const allParameterValues = Object.fromEntries(
        [
          'ph',
          'soc',
          'organic_matter',
          'ocs',
          'clay',
          'sand',
          'silt',
          'cfvo',
          'bulk_density',
          'nitrogen',
          'phosphorus',
          'potassium',
          'cec',
          'salinity',
          'awc',
        ].map((key, index) => [key, 123.456789 + index]),
      );

      const largeBatch = (sampleCount: number) =>
        batch({
          samples: Array.from({ length: sampleCount }, (_, index) =>
            sample({ row: index + 2, values: allParameterValues }),
          ),
        });

      test('saves a body over the default 100kB limit', async () => {
        const body = largeBatch(300);
        expect(Buffer.byteLength(JSON.stringify(body))).toBeGreaterThan(100 * 1024);

        const res = await postBatch(body);
        expect(res.status).toBe(201);
        expect(await liveRowCount(body.submission_id)).toBe(300);
      });

      test('refuses a body over 256kB with 413', async () => {
        const res = await postBatch(batch({ source_filename: 'x'.repeat(300 * 1024) }));
        expect(res.status).toBe(413);
      });

      test('other routes keep the 100kB limit', async () => {
        const res = await chai
          .request(server)
          .post('/farm')
          .set('content-type', 'application/json')
          .set('Authorization', `Bearer ${createToken('access', { user_id: owner.user_id })}`)
          .send({ farm_name: 'x'.repeat(150 * 1024) });
        expect(res.status).toBe(413);
      });
    });

    test('stores nothing when one sample is invalid', async () => {
      const body = batch({
        samples: [sample(), sample({ row: 3, location_id: otherFarmLocation.location_id })],
      });
      const res = await postBatch(body);
      expect(res.status).toBe(400);
      expect(await liveRowCount(body.submission_id)).toBe(0);
    });
  });

  describe('PUT', () => {
    test('replaces the batch with new ids', async () => {
      const body = batch();
      const first = await postBatch(body);

      const replacement = { ...body, samples: [sample({ row: 4, values: { ph: 7.1 } })] };
      const res = await putBatch(body.submission_id, replacement);

      expect(res.status).toBe(200);
      expect(res.body.soil_lab_results).toEqual([{ row: 4, id: expect.any(String) }]);
      const oldIds = first.body.soil_lab_results!.map(({ id }) => id);
      expect(oldIds).not.toContain(res.body.soil_lab_results![0].id);

      const oldRows = await knex('soil_lab_result').whereIn('id', oldIds);
      expect(oldRows.every((row) => row.deleted)).toBe(true);
      expect(await liveRowCount(body.submission_id)).toBe(1);
    });

    test('a replaced batch drops out of GET', async () => {
      const body = batch();
      await postBatch(body);
      await putBatch(body.submission_id, { ...body, samples: [sample({ row: 9 })] });

      const res = await send('get', PATH, { token: saveToken(owner.user_id) });
      expect(
        res.body.filter((row) => row.submission_id === body.submission_id).map((row) => row.row),
      ).toEqual([9]);
    });

    test('returns 404 for an unknown submission_id', async () => {
      const body = batch();
      const res = await putBatch(body.submission_id, body);
      expect(res.status).toBe(404);
    });

    test("returns 400 when the body's submission_id differs from the URL's", async () => {
      const body = batch();
      await postBatch(body);
      const res = await putBatch(body.submission_id, { ...body, submission_id: randomUUID() });
      expect(res.status).toBe(400);
    });

    test('returns 409 for a batch on another farm', async () => {
      const otherFarmBatch = batch({
        samples: [sample({ location_id: otherFarmLocation.location_id })],
      });
      await postBatch(otherFarmBatch, outsider, otherFarm.farm_id);

      const res = await putBatch(otherFarmBatch.submission_id, {
        ...batch(),
        submission_id: otherFarmBatch.submission_id,
      });
      expect(res.status).toBe(409);
      expect(await liveRowCount(otherFarmBatch.submission_id)).toBe(1);
    });

    test('a worker can correct a batch', async () => {
      const body = batch();
      await postBatch(body);
      const res = await putBatch(body.submission_id, body, worker);
      expect(res.status).toBe(200);
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
