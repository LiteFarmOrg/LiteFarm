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

// Mock S3/imaginary so file upload tests work without live infrastructure
jest.mock('../src/util/digitalOceanSpaces.js', () => ({
  s3: { send: jest.fn().mockResolvedValue({}) },
  getPrivateS3BucketName: jest.fn().mockReturnValue('test-bucket'),
  getPrivateS3Url: jest.fn().mockReturnValue('http://localhost:9000/test-bucket'),
  imaginaryPost: jest.fn().mockResolvedValue({ data: Buffer.from('fake-image') }),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((args) => args),
}));

async function getRequest({ user_id, farm_id }) {
  return chai.request(server).get('/farm_note').set('user_id', user_id).set('farm_id', farm_id);
}

async function postRequest(data, file, { user_id, farm_id }) {
  const request = chai
    .request(server)
    .post('/farm_note')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .field('data', JSON.stringify(data));

  if (file) {
    request.attach('_file_', file.buffer, file.name);
  }

  return request;
}

async function patchRequest(id, data, file, { user_id, farm_id }) {
  const request = chai
    .request(server)
    .patch(`/farm_note/${id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id);

  if (data) {
    request.field('data', JSON.stringify(data));
  }
  if (file) {
    request.attach('_file_', file.buffer, file.name);
  }

  return request;
}

async function deleteRequest(id, { user_id, farm_id }) {
  return chai
    .request(server)
    .delete(`/farm_note/${id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

const expectFarmNote = (expectedNote, returnedNotes) => {
  const returnedNote = returnedNotes.find(({ id }) => id === expectedNote.id);
  for (const property of ['note', 'is_private', '']) {
    expect(returnedNote[property]).toBe(expectedNote[property]);
  }
};

describe('Farm Note tests', () => {
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET /farm_note', () => {
    test('Returns public notes for any farm member', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const farmNote = { note: 'Public note', is_private: false };
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { farm_id, user_id: author_id } },
        farmNote,
      );

      for (const roleId of [1, 2, 3, 5]) {
        const [{ user_id: reader_id }] = await mocks.userFarmFactory({
          promisedFarm: [{ farm_id }],
          roleId,
        });

        const res = await getRequest({ user_id: reader_id, farm_id });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expectFarmNote(createdNote, res.body);
      }
    });

    test('Private notes are only returned to the author', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const [{ user_id: other_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] });
      const farmNote = { note: 'Private note for author', is_private: true };
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { farm_id, user_id: author_id } },
        farmNote,
      );

      // Author can see their own private note
      const authorRes = await getRequest({ user_id: author_id, farm_id });
      expect(authorRes.status).toBe(200);
      expectFarmNote(createdNote, authorRes.body);

      // Other member cannot see the private note
      const otherRes = await getRequest({ user_id: other_id, farm_id });
      expect(otherRes.status).toBe(200);
      expect(otherRes.body.find(({ id }) => id === createdNote.id)).toBe(undefined);
    });

    test('Returns 403 for user on a different farm', async () => {
      const { user_id } = await createUserFarmIds(1);
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await getRequest({ user_id, farm_id: other_farm_id });
      expect(res.status).toBe(403);
    });

    test('Deleted notes are not returned', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [createdNote] = await mocks.farm_noteFactory({ promisedUserFarm: userFarmIds });
      await knex('farm_note').where('id', createdNote.id).update({ deleted: true });

      const res = await getRequest(userFarmIds);
      const deletedNote = res.body.find(({ id }) => id === createdNote.id);
      expect(deletedNote).toBe(undefined);
    });

    test('Should return notes ordered by updated_at desc', async () => {
      const userFarmIds = await createUserFarmIds(1);

      for (const note of ['A', 'B', 'C']) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        await mocks.farm_noteFactory({ promisedUserFarm: userFarmIds }, { note });
      }

      const res = await getRequest(userFarmIds);
      expect(res.body.length).toBe(3);
      expect(res.body[0].note).toBe('C');
      expect(res.body[1].note).toBe('B');
      expect(res.body[2].note).toBe('A');

      // Update note B
      await knex('farm_note')
        .where({ ...userFarmIds, note: 'B' })
        .update({ note: 'Newest note', updated_at: new Date().toISOString() });

      const updatedRes = await getRequest(userFarmIds);
      expect(updatedRes.body.length).toBe(3);
      expect(updatedRes.body[0].note).toBe('Newest note');
      expect(updatedRes.body[1].note).toBe('C');
      expect(updatedRes.body[2].note).toBe('A');
    });

    test('Returns empty array when farm has no notes', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const res = await getRequest(userFarmIds);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('POST /farm_note', () => {
    test('Creates a note without file', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const farmNote = { note: 'Test create note', is_private: false };

      const res = await postRequest(farmNote, undefined, userFarmIds);
      expect(res.status).toBe(201);
      expect(res.body.note).toBe(farmNote.note);
      expect(res.body.farm_id).toBe(userFarmIds.farm_id);
      expect(res.body.user_id).toBe(userFarmIds.user_id);
      expect(res.body.updated_at).toBeDefined();
    });

    test('Creates a private note', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const farmNote = { note: 'Private create note', is_private: true };

      const res = await postRequest(farmNote, undefined, userFarmIds);
      expect(res.status).toBe(201);
      expect(res.body.is_private).toBe(true);
    });

    test('Creates a note with file, stores image_url', async () => {
      const userFarmIds = await createUserFarmIds(1);

      const res = await postRequest(
        { note: 'Note with file', is_private: false },
        { buffer: Buffer.from('fake-image-data'), name: 'test.jpg' },
        userFarmIds,
      );

      expect(res.status).toBe(201);
      expect(res.body.image_url).toBeDefined();
      expect(typeof res.body.image_url).toBe('string');
    });

    test('Returns 403 for user on a different farm', async () => {
      const { user_id } = await createUserFarmIds(1);
      const [{ farm_id: other_farm_id }] = await mocks.farmFactory();

      const res = await postRequest({ note: 'Should fail', is_private: false }, undefined, {
        user_id,
        farm_id: other_farm_id,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /farm_note/:id', () => {
    test('Author can update note text and is_private', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const originalNote = { note: 'Original text', is_private: false };
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: userFarmIds },
        originalNote,
      );

      const updatedNote = { note: 'Updated text', is_private: true };
      const res = await patchRequest(createdNote.id, updatedNote, undefined, userFarmIds);

      expect(res.status).toBe(200);
      expect(res.body.note).toBe(updatedNote.note);
      expect(res.body.is_private).toBe(updatedNote.is_private);
    });

    test('Non-author receives 403', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const [{ user_id: other_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] });
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { farm_id, user_id: author_id } },
        { note: 'Should not be edited', is_private: false },
      );

      const res = await patchRequest(createdNote.id, { note: 'Edited by non-author' }, undefined, {
        user_id: other_id,
        farm_id,
      });

      expect(res.status).toBe(403);
    });

    test('Returns 403 for user on a different farm', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const [{ user_id: other_user_id, farm_id: other_farm_id }] = await mocks.userFarmFactory();
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { farm_id, user_id: author_id } },
        { note: 'Wrong farm', is_private: false },
      );

      const res = await patchRequest(createdNote.id, { note: 'Should fail' }, undefined, {
        user_id: other_user_id,
        farm_id: other_farm_id,
      });

      expect(res.status).toBe(403);
    });

    test('Author can remove the image', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: userFarmIds },
        {
          note: 'NOTE with image to be removed',
          image_url: 'http://example.com/image.jpg',
        },
      );

      const res = await patchRequest(createdNote.id, { image_url: null }, undefined, userFarmIds);
      expect(res.status).toBe(200);
      expect(res.body.image_url).toBe(null);
    });
  });

  describe('DELETE /farm_note/:id', () => {
    test('Author can soft-delete their note', async () => {
      const userFarmIds = await createUserFarmIds(1);
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: userFarmIds },
        { note: 'To be deleted' },
      );

      const res = await deleteRequest(createdNote.id, userFarmIds);
      expect(res.status).toBe(200);

      const [deletedRecord] = await knex('farm_note').where('id', createdNote.id);
      expect(deletedRecord.deleted).toBe(true);
    });

    test('Non-author receives 403', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const [{ user_id: other_id }] = await mocks.userFarmFactory({ promisedFarm: [{ farm_id }] });
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { user_id: author_id, farm_id } },
        { note: 'Protected note', is_private: false },
      );

      const res = await deleteRequest(createdNote.id, { user_id: other_id, farm_id });
      expect(res.status).toBe(403);
    });

    test('Returns 403 for user on a different farm', async () => {
      const { user_id: author_id, farm_id } = await createUserFarmIds(1);
      const [{ user_id: other_user_id, farm_id: other_farm_id }] = await mocks.userFarmFactory();
      const [createdNote] = await mocks.farm_noteFactory(
        { promisedUserFarm: { farm_id, user_id: author_id } },
        { note: 'Wrong farm', is_private: false },
      );

      const res = await deleteRequest(createdNote.id, {
        user_id: other_user_id,
        farm_id: other_farm_id,
      });
      expect(res.status).toBe(403);
    });
  });
});
