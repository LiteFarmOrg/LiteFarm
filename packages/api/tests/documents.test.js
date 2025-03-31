import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from '../src/server.js';
import knex from '../src/util/knex.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import { tableCleanup } from './testEnvironment.js';

describe('Document tests', () => {
  function getRequest(url, { user_id, farm_id }) {
    return chai.request(server).get(url).set('user_id', user_id).set('farm_id', farm_id);
  }

  function patchDocumentArchiveRequest(document_id, data, { user_id, farm_id }) {
    return chai
      .request(server)
      .patch(`/document/archive/${document_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function postManagementPlanRequest(url, data, { user_id, farm_id }) {
    return chai
      .request(server)
      .post(url)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function putDocumentRequest(data, { user_id, farm_id }) {
    const { document_id } = data;

    return chai
      .request(server)
      .put(`/document/${document_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  describe('GET Authorization tests', () => {
    test('Owner should GET documents if they exist', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      const res = await getRequest(`/document/farm/${farm_id}`, { user_id, farm_id });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    test('Manager should GET documents if they exist', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      const res = await getRequest(`/document/farm/${farm_id}`, { user_id, farm_id });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    test('EO should GET documents if they exist', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      const res = await getRequest(`/document/farm/${farm_id}`, { user_id, farm_id });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('Post and put documents tests', () => {
    function getFakeDocument(
      farm_id,
      numberOfFiles,
      files = Array.apply(null, { length: numberOfFiles }).map(() => mocks.fakeFile()),
    ) {
      return { ...mocks.fakeDocument(), farm_id, files };
    }

    describe('Post document test', () => {
      test('Should return 400 when files === []', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

        const res = await postManagementPlanRequest(
          `/document/farm/${farm_id}`,
          getFakeDocument(farm_id, 0),
          {
            user_id,
            farm_id,
          },
        );

        expect(res.status).toBe(400);
      });
      test('Should return 400 when files is not an array', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

        const res = await postManagementPlanRequest(
          `/document/farm/${farm_id}`,
          getFakeDocument(farm_id, 0, 'files'),
          {
            user_id,
            farm_id,
          },
        );

        expect(res.status).toBe(400);
      });
      test('Should post document with multiple files', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));

        const res = await postManagementPlanRequest(
          `/document/farm/${farm_id}`,
          getFakeDocument(farm_id, 4),
          {
            user_id,
            farm_id,
          },
        );

        expect(res.status).toBe(201);
        const files = await knex('file').where({ document_id: res.body.document_id });
        expect(files.length).toBe(4);
      });
      describe('Post document authorization test', function () {
        test('Worker should not POST documents', async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });

          const res = await postManagementPlanRequest(
            `/document/farm/${farm_id}`,
            getFakeDocument(farm_id, 4),
            {
              user_id,
              farm_id,
            },
          );

          expect(res.status).toBe(403);
        });
        test('Owner should POST a document', async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });

          const res = await postManagementPlanRequest(
            `/document/farm/${farm_id}`,
            getFakeDocument(farm_id, 1),
            {
              user_id,
              farm_id,
            },
          );

          expect(res.status).toBe(201);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        });
        test('Manager should POST a document', async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });

          const res = await postManagementPlanRequest(
            `/document/farm/${farm_id}`,
            getFakeDocument(farm_id, 1),
            {
              user_id,
              farm_id,
            },
          );

          expect(res.status).toBe(201);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        });
        test('EO should POST a document', async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });

          const res = await postManagementPlanRequest(
            `/document/farm/${farm_id}`,
            getFakeDocument(farm_id, 1),
            {
              user_id,
              farm_id,
            },
          );

          expect(res.status).toBe(201);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        });
      });
    });
    describe.only('Put document test', () => {
      async function documentWithFilesFactory(farm_id, numberOfFiles = 2) {
        const [document] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
        const files = [];
        for (let i = 0; i < numberOfFiles; i++) {
          const [file] = await mocks.fileFactory({
            promisedDocument: [document],
            promisedFarm: [{ farm_id }],
          });
          files.push(file);
        }
        return { ...document, files };
      }

      const fakeDate = new Date(0).toISOString().split('T')[0];

      test('Owner should be able to edit a document, add files', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const document = await documentWithFilesFactory(farm_id, 1);
        const newDocument = getFakeDocument(farm_id, 2);
        const data = { document_id: document.document_id, ...newDocument };
        data.valid_until = fakeDate;

        {
          const res = await putDocumentRequest(data, { user_id, farm_id });
          expect(res.status).toBe(201);
          const document = await knex('document').where({ document_id: res.body.document_id });
          expect(document[0].name).toBe(newDocument.name);
          expect(document[0].type).toBe(newDocument.type);
          //dates returned are not what is stored see LF-3396
          expect(document[0].valid_until.toISOString().split('T')[0]).toEqual(fakeDate);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(2);
        }
      });

      test('Owner should be able to edit a document, delete files', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const document = await documentWithFilesFactory(farm_id, 3);
        const newDocument = getFakeDocument(farm_id, 1);
        const data = { document_id: document.document_id, ...newDocument };
        data.valid_until = fakeDate;

        {
          const res = await putDocumentRequest(data, { user_id, farm_id });
          expect(res.status).toBe(201);
          const document = await knex('document').where({ document_id: res.body.document_id });
          expect(document[0].name).toBe(newDocument.name);
          expect(document[0].type).toBe(newDocument.type);
          //dates returned are not what is stored see LF-3396
          expect(document[0].valid_until.toISOString().split('T')[0]).toEqual(fakeDate);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        }
      });

      test('Manager shoud be able to edit a document', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
        const document = await documentWithFilesFactory(farm_id, 3);
        const newDocument = getFakeDocument(farm_id, 1);
        const data = { document_id: document.document_id, ...newDocument };
        data.valid_until = fakeDate;

        {
          const res = await putDocumentRequest(data, { user_id, farm_id });
          expect(res.status).toBe(201);
          const document = await knex('document').where({ document_id: res.body.document_id });
          expect(document[0].name).toBe(newDocument.name);
          expect(document[0].type).toBe(newDocument.type);
          //dates returned are not what is stored see LF-3396
          expect(document[0].valid_until.toISOString().split('T')[0]).toEqual(fakeDate);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        }
      });

      test('EO shoud be able to edit a document', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
        const document = await documentWithFilesFactory(farm_id, 3);
        const newDocument = getFakeDocument(farm_id, 1);
        const data = { document_id: document.document_id, ...newDocument };
        data.valid_until = fakeDate;

        {
          const res = await putDocumentRequest(data, { user_id, farm_id });
          expect(res.status).toBe(201);
          const document = await knex('document').where({ document_id: res.body.document_id });
          expect(document[0].name).toBe(newDocument.name);
          expect(document[0].type).toBe(newDocument.type);
          //dates returned are not what is stored see LF-3396
          expect(document[0].valid_until.toISOString().split('T')[0]).toEqual(fakeDate);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(1);
        }
      });

      test('Worker should not be a able to update document', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
        const document = await documentWithFilesFactory(farm_id);
        const newDocument = getFakeDocument(farm_id, 1);
        const data = { document_id: document.document_id, ...newDocument };
        const res = await putDocumentRequest(data, { user_id, farm_id });
        expect(res.status).toBe(403);
      });
    });
  });

  describe('Archive document tests', () => {
    test('User should be able to archive documents', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const [{ document_id }] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      const res = await patchDocumentArchiveRequest(
        document_id,
        { archived: true },
        { user_id, farm_id },
      );
      expect(res.status).toBe(200);
      const document = await knex('document').where({ document_id });
      expect(document[0].archived).toBe(true);
    });

    test('User should be able to unarchive documents', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const [{ document_id }] = await mocks.documentFactory(
        { promisedFarm: [{ farm_id }] },
        mocks.fakeDocument({ archived: true }),
      );
      const res = await patchDocumentArchiveRequest(
        document_id,
        { archived: false },
        { user_id, farm_id },
      );
      expect(res.status).toBe(200);
      const document = await knex('document').where({ document_id });
      expect(document[0].archived).toBe(false);
    });

    describe('Archive document authorization tests', () => {
      test('Owner should be able to archive documents', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const [{ document_id }] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
        const res = await patchDocumentArchiveRequest(
          document_id,
          { archived: true },
          { user_id, farm_id },
        );
        expect(res.status).toBe(200);
      });
      test('Manager should be able to archive documents', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
        const [{ document_id }] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
        const res = await patchDocumentArchiveRequest(
          document_id,
          { archived: true },
          { user_id, farm_id },
        );
        expect(res.status).toBe(200);
      });
      test('EO should be able to archive documents', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
        const [{ document_id }] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
        const res = await patchDocumentArchiveRequest(
          document_id,
          { archived: true },
          { user_id, farm_id },
        );
        expect(res.status).toBe(200);
      });
      test('Worker should NOT be able to archive documents', async () => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
        const [{ document_id }] = await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
        const res = await patchDocumentArchiveRequest(
          document_id,
          { archived: true },
          { user_id, farm_id },
        );
        expect(res.status).toBe(403);
      });
    });
  });
});
