/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (farmAPI.test.js) is part of LiteFarm.
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

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const server = 'http://localhost:5000';
const dummy = require('./dummy');

beforeAll(() => {
  // beforeAll is set before each test
  // global.token is set in testEnvironment.js
  token = global.token;
});

describe('Testing farm API', () => {
  let farm_id = null;

  test('POST farm happy land to DB', (done) => {
    chai.request(server).post('/farm')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(dummy.mockFarm)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('farm_id');
        farm_id = res.body.farm_id;
        done();
      });
  });

  test('GET farm happy land from DB', (done) => {
    chai.request(server).get('/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('PUT farm happy land with new name', (done) => {
    chai.request(server).put('/farm/' + farm_id)
      .set('Authorization', 'Bearer '+token)
      .set('content-type', 'application/json')
      .send(dummy.mockFarmPut)
      .end((err, res) => {
        chai_expect(res.status).to.equal(200);
        chai_expect(res.body[0].farm_name).to.equal('sad land');
        done();
      });
  });

  test('PUT farm baa15588-4ddb-4ab1-b33e-f3e0a66966ea(does not exist)', (done) => {
    chai.request(server).put('/farm/baa15588-4ddb-4ab1-b33e-f3e0a66966ea')
      .set('Authorization', 'Bearer '+token)
      .set('content-type', 'application/json')
      .send(dummy.notExistFarm)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(404);
        done();
      });
  });

  test('UPDATE test users farm_id to null', (done) => {
    chai.request(server).put('/user/' + dummy.testUser.user_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(dummy.testUser)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('DELETE farm sad land should get 200' , (done) => {
    chai.request(server).del('/farm/' + farm_id)
      .set('Authorization', 'Bearer '+token)
      .set('content-type', 'application/json')
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET farm sad land should get 401' , (done) => {
    chai.request(server).get('/farm/' + farm_id)
      .set('Authorization', 'Bearer '+token)
      .set('content-type', 'application/json')
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(401);
        done();
      });
  });

});
