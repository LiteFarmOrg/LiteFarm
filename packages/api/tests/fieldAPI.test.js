/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fieldAPI.test.js) is part of LiteFarm.
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

xdescribe('Testing field API', () => {

  let farm_id = null, field_id;

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

   test('POST a field to DB', (done) => {
    let field = dummy.mockField;
    field.farm_id = farm_id;
    chai.request(server).post('/field')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(field)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('field_id');
        field_id = res.body.field_id;
        done();
      });
  });

  test('GET fields associated with farm id from DB', (done) => {
    chai.request(server).get('/field/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        chai_expect(res.body.length).to.equal(1);
        chai_expect(res.body[0].field_id).to.equal(field_id);
        done();
      });
  });


  test('PUT field 123 with new bed_width', (done) => {
    let field = dummy.mockFieldPut;
    field.farm_id = farm_id;
    chai.request(server).put('/field/' + field_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(field)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        chai_expect(res.body[0].grid_points.length).to.equal(5);
        done();
      });
  });

  test('PUT field baa15588-4ddb-4ab1-b33e-f3e0a66966ea(does not exist)', (done) => {
    let field = dummy.mockField;
    field.farm_id = farm_id;
    chai.request(server).put('/field/baa15588-4ddb-4ab1-b33e-f3e0a66966ea')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(field)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(401);
        done();
      });
  });

  test('DELETE field should get 200' , (done) => {
    chai.request(server).del('/field/' + field_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET field 123 should get 404' , (done) => {
    chai.request(server).get('/field/' + field_id)
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

  test('DELETE farm sad land should get 200' , (done) => {
    chai.request(server).del('/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('GET farm sad land should get 401' , (done) => {
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
