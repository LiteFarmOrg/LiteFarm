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

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);

// Mock S3/imaginary so file upload tests work without live infrastructure
jest.mock('../src/util/digitalOceanSpaces.js', () => ({
  s3: { send: jest.fn().mockResolvedValue({}) },
  getPublicS3BucketName: jest.fn().mockReturnValue('test-bucket'),
  getPublicS3Url: jest.fn().mockReturnValue('http://localhost:9000/test-bucket'),
  imaginaryPost: jest.fn().mockResolvedValue({ data: Buffer.from('fake-image') }),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((args) => args),
}));

function fakeUserFarm(role = 1) {
  return { ...mocks.fakeUserFarm(), role_id: role };
}

async function insertNote(knex, { farm_id, user_id, note, is_private = false, image_url = null }) {
  const [row] = await knex('farm_note')
    .insert({
      farm_id,
      user_id,
      note,
      is_private,
      image_url,
      created_by_user_id: user_id,
      updated_by_user_id: user_id,
    })
    .returning('*');
  return row;
}

describe('Farm Note tests', () => {
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET /farm_note', () => {
    test('Returns public notes for any farm member', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: reader_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      await insertNote(knex, {
        farm_id,
        user_id: author_id,
        note: 'Public note',
        is_private: false,
      });

      const res = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', reader_id)
        .set('farm_id', farm_id);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.some((n) => n.note === 'Public note')).toBe(true);
    });

    test('Private notes are only returned to the author', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      await insertNote(knex, {
        farm_id,
        user_id: author_id,
        note: 'Private note for author',
        is_private: true,
      });

      // Author can see their own private note
      const authorRes = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', author_id)
        .set('farm_id', farm_id);
      expect(authorRes.status).toBe(200);
      expect(authorRes.body.some((n) => n.note === 'Private note for author')).toBe(true);

      // Other member cannot see the private note
      const otherRes = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', other_id)
        .set('farm_id', farm_id);
      expect(otherRes.status).toBe(200);
      expect(otherRes.body.some((n) => n.note === 'Private note for author')).toBe(false);
    });

    test('Returns a plain array (not wrapped in an object)', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

      const res = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', farm_id);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).not.toHaveProperty('has_unread');
    });

    test('Returns 403 for user on a different farm', async () => {
      const [{ user_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', other_farm_id);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /farm_note', () => {
    test('Creates a note without file', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

      const res = await chai
        .request(server)
        .post('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .field('data', JSON.stringify({ note: 'Test create note', is_private: false }));

      expect(res.status).toBe(201);
      expect(res.body.note).toBe('Test create note');
      expect(res.body.farm_id).toBe(farm_id);
      expect(res.body.user_id).toBe(user_id);
      expect(res.body.created_at).toBeDefined();
    });

    test('Creates a private note', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

      const res = await chai
        .request(server)
        .post('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .field('data', JSON.stringify({ note: 'Private create note', is_private: true }));

      expect(res.status).toBe(201);
      expect(res.body.is_private).toBe(true);
    });

    test('Creates a note with file, stores image_url', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

      const res = await chai
        .request(server)
        .post('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .field('data', JSON.stringify({ note: 'Note with image', is_private: false }))
        .attach('_file_', Buffer.from('fake-image-data'), 'test.jpg');

      expect(res.status).toBe(201);
      expect(res.body.image_url).toBeDefined();
      expect(typeof res.body.image_url).toBe('string');
    });

    test('Returns 403 for user on a different farm', async () => {
      const [{ user_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await chai
        .request(server)
        .post('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', other_farm_id)
        .field('data', JSON.stringify({ note: 'Should fail', is_private: false }));

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /farm_note/:farm_note_id', () => {
    test('Author can update note text and is_private', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const note = await insertNote(knex, {
        farm_id,
        user_id,
        note: 'Original text',
        is_private: false,
      });

      const res = await chai
        .request(server)
        .patch(`/farm_note/${note.farm_note_id}`)
        .set('user_id', user_id)
        .set('farm_id', farm_id)
        .send({ note: 'Updated text', is_private: true });

      expect(res.status).toBe(200);
      expect(res.body.note).toBe('Updated text');
      expect(res.body.is_private).toBe(true);
    });

    test('Non-author receives 403', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      const note = await insertNote(knex, {
        farm_id,
        user_id: author_id,
        note: 'Should not be edited',
      });

      const res = await chai
        .request(server)
        .patch(`/farm_note/${note.farm_note_id}`)
        .set('user_id', other_id)
        .set('farm_id', farm_id)
        .send({ note: 'Edited by non-author', is_private: false });

      expect(res.status).toBe(403);
    });

    test('Returns 403 for user on a different farm', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id, farm_id: other_farm_id }] = await mocks.userFarmFactory(
        {},
        fakeUserFarm(1),
      );
      const note = await insertNote(knex, {
        farm_id,
        user_id: author_id,
        note: 'Wrong farm',
      });

      const res = await chai
        .request(server)
        .patch(`/farm_note/${note.farm_note_id}`)
        .set('user_id', other_user_id)
        .set('farm_id', other_farm_id)
        .send({ note: 'Should fail', is_private: false });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /farm_note/:farm_note_id', () => {
    test('Author can soft-delete their note', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const note = await insertNote(knex, { farm_id, user_id, note: 'To be deleted' });

      const res = await chai
        .request(server)
        .delete(`/farm_note/${note.farm_note_id}`)
        .set('user_id', user_id)
        .set('farm_id', farm_id);

      expect(res.status).toBe(200);

      // Verify soft-deleted — should not appear in GET
      const getRes = await chai
        .request(server)
        .get('/farm_note')
        .set('user_id', user_id)
        .set('farm_id', farm_id);
      expect(getRes.body.some((n) => n.farm_note_id === note.farm_note_id)).toBe(false);
    });

    test('Non-author receives 403', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_id }] = await mocks.userFarmFactory(
        { promisedFarm: [{ farm_id }] },
        fakeUserFarm(2),
      );
      const note = await insertNote(knex, { farm_id, user_id: author_id, note: 'Protected note' });

      const res = await chai
        .request(server)
        .delete(`/farm_note/${note.farm_note_id}`)
        .set('user_id', other_id)
        .set('farm_id', farm_id);

      expect(res.status).toBe(403);
    });

    test('Returns 403 for user on a different farm', async () => {
      const [{ user_id: author_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      const [{ user_id: other_user_id, farm_id: other_farm_id }] = await mocks.userFarmFactory(
        {},
        fakeUserFarm(1),
      );
      const note = await insertNote(knex, { farm_id, user_id: author_id, note: 'Wrong farm' });

      const res = await chai
        .request(server)
        .delete(`/farm_note/${note.farm_note_id}`)
        .set('user_id', other_user_id)
        .set('farm_id', other_farm_id);

      expect(res.status).toBe(403);
    });
  });
});
