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
  function getRequest(url, { user_id , farm_id }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function archiveDocumentRequest(document_id, { user_id, farm_id }, callback) {
    chai.request(server).patch(`/document/archive/document/${document_id}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
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

  describe('GET Authorization tests', () => {
    test('Owner should GET documents if they exist', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
      await mocks.documentFactory({promisedFarm: [{farm_id}]});
      getRequest(`/document/farm/${farm_id}`, {user_id, farm_id}, (err, res) => {
        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1);
        done();
      })
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
      await mocks.documentFactory({promisedFarm: [{farm_id}]});
      getRequest(`/document/farm/${farm_id}`, {user_id, farm_id}, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        done();
      })
    });

    test('Worker should not GET documents', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
      await mocks.documentFactory({promisedFarm: [{farm_id}]});
      getRequest(`/document/farm/${farm_id}`, {user_id, farm_id}, (err, res) => {
        expect(res.status).toBe(403);
        done();
      })
    });



  });

  describe('Archive document tests', ()=>{
    test('User should be able to archive documents', async (done) => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
      const [{ document_id }] = await mocks.documentFactory({promisedFarm: [{farm_id}]});
      archiveDocumentRequest(document_id, {user_id, farm_id}, (err, res) => {
        expect(res.status).toBe(200);
        done();
      })
    });

    describe('Archive document authorization tests',()=>{

      test('Owner should be able to archive documents', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(1));
        const [{ document_id }] = await mocks.documentFactory({promisedFarm: [{farm_id}]});
        archiveDocumentRequest(document_id, {user_id, farm_id}, (err, res) => {
          expect(res.status).toBe(200);
          done();
        })
      });
      test('Manager should be able to archive documents', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(2));
        const [{ document_id }] = await mocks.documentFactory({promisedFarm: [{farm_id}]});
        archiveDocumentRequest(document_id, {user_id, farm_id}, (err, res) => {
          expect(res.status).toBe(200);
          done();
        })
      });
      test('EO should be able to archive documents', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(5));
        const [{ document_id }] = await mocks.documentFactory({promisedFarm: [{farm_id}]});
        archiveDocumentRequest(document_id, {user_id, farm_id}, (err, res) => {
          expect(res.status).toBe(200);
          done();
        })
      });
      test('Worker should NOT be able to archive documents', async (done) => {
        const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, fakeUserFarm(3));
        const [{ document_id }] = await mocks.documentFactory({promisedFarm: [{farm_id}]});
        archiveDocumentRequest(document_id, {user_id, farm_id}, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

    })

  })

})