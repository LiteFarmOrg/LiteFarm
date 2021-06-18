const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');



describe('Document tests', () => {
  let middleware;
  beforeEach(() =>{
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  })

  function getRequest(url, { user_id, farm_id }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function postManagementPlanRequest(url, data, { user_id, farm_id }, callback) {
    chai.request(server).post(url)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get documents authorization tests', () => {
    test('Owner should GET documents if they exist', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      getRequest(`/document/farm/${farm_id}`, { user_id, farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        done();
      });
    });

    test('Manager should GET documents if they exist', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      await mocks.documentFactory({promisedFarm: [{farm_id}]});
      getRequest(`/document/farm/${farm_id}`, {user_id, farm_id}, (err, res) => {
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1);
        done();
      })
    });

    test('EO should GET documents if they exist', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
      await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
      getRequest(`/document/farm/${farm_id}`, { user_id, farm_id }, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        done();
      });
    });


  });

  describe('Post and put documents tests', () => {
    function getFakeDocument(numberOfFiles, files = new Array(numberOfFiles).map(_ => mocks.fakeFile())) {
      return { ...mocks.fakeDocument(), files };
    }

    describe('Post document test', () => {
      test('Should return 400 when files === []', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(0), { user_id, farm_id }, (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should return 400 when files is not an array', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(0, 'files'), {
          user_id,
          farm_id,
        }, (err, res) => {
          expect(res.status).toBe(400);
          done();
        });
      });
      test('Should post document with multiple files', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const document = getFakeDocument(4);
        postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(4), {
          user_id,
          farm_id,
        }, async (err, res) => {
          expect(res.status).toBe(201);
          const files = await knex('file').where({ document_id: res.body.document_id });
          expect(files.length).toBe(4);
          done();
        });
      });
      describe('Post document authorization test', function() {
        test('Worker should not POST documents', async (done) => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
          postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(4), {
            user_id,
            farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });
        test('Owner should POST a document', async (done) => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
          postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(1), {
            user_id,
            farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(201);
            const files = await knex('file').where({ document_id: res.body.document_id });
            expect(files.length).toBe(1);
            done();
          });
        });
        test('Manager should POST a document', async (done) => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
          postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(1), {
            user_id,
            farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(201);
            const files = await knex('file').where({ document_id: res.body.document_id });
            expect(files.length).toBe(1);
            done();
          });
        });
        test('EO should POST a document', async (done) => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
          await mocks.documentFactory({ promisedFarm: [{ farm_id }] });
          postManagementPlanRequest(`/document/farm/${farm_id}`, getFakeDocument(1), {
            user_id,
            farm_id,
          }, async (err, res) => {
            expect(res.status).toBe(201);
            const files = await knex('file').where({ document_id: res.body.document_id });
            expect(files.length).toBe(1);
            done();
          });
        });
      });
    });
    describe('Put document test', () => {

    });
  });


})
