/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (userAPI.test.js) is part of LiteFarm.
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

describe('Testing User API', () => {
  const uid = dummy.mockUser.user_id;
  let farm_id = null;

  test('POST user to DB', (done) => {
    chai.request(server).post('/user')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(dummy.mockUser)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        done();
      });
  });

  test('GET user 123 from DB', (done) => {
    chai.request(server).get('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('POST user 256 to DB with same email as user 123', (done) => {
    let mockUser = Object.assign({}, dummy.mockUser);
    mockUser.user_id = dummy.mockUserDuplicateEmail.user_id;
    chai.request(server).post('/user')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(mockUser)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(400);
        done();
      });
  });

  test('PUT user with new name', (done) => {
    chai.request(server).put('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(dummy.mockUserPut)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        chai_expect(res.body[0].last_name).to.equal('food');
        done();
      });
  });

  test('PUT user (does not exist) should get 404', (done) => {
    chai.request(server).put('/user/1c42b718-83cd-11e8-b158-e0accb890fd7/')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(dummy.notExistUser)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(404);
        done();
      });
  });


  test('POST farm happy land to DB to setup test', (done) => {
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

  test('PUT user with farm_id', (done) => {
    let user = dummy.mockUser;
    user.farm_id = farm_id;
    chai.request(server).put('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(user)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('PUT user with NOT EXISTING farm_id', (done) => {
    let user = dummy.mockUser;
    user.farm_id = 'e0867a9a-41b3-4d50-9816-1a9410ad9073';
    chai.request(server).put('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(user)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(400);
        done();
      });
  });

  test('DELETE user should get 200' , (done) => {
    chai.request(server).del('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET user 123 should get 404' , (done) => {
    chai.request(server).get('/user/' + uid)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
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

  test('DELETE farm should get 200' , (done) => {
    chai.request(server).del('/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET farm should get 401' , (done) => {
    chai.request(server).get('/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(401);
        done();
      });
  });


});
