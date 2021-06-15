const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');
const { tableCleanup } = require('./testEnvironment');



describe('Document tests', () => {

  function getRequest(url, { user_id , farm_id }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  describe('Authorization tests', () => {
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
})