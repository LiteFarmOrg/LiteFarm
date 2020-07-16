/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (cropRelatedAPI.test.js) is part of LiteFarm.
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

describe('This is a test for crop, farm crop and crop bed', () => {
  // need farm_id to post to crop
  // need bed_id to post to crop bed
  let farm_id = null, crop_id, farm_crop_id, field_id, bed_id, second_farm_crop_id;

  test('POST farm to set up tests', (done) => {
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

  test('GET farm from DB to verify post', (done) => {
    chai.request(server).get('/farm/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
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

  test('GET crop #20 from DB', (done) => {
    chai.request(server).get('/crop/20')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(res.status).to.equal(200);
        //TODO: deep equal not working
        //chai_expect(res.body[0]).to.deep.equal(dummy.cropResponse);
        done();
      });
  });

  test('GET crop #20 from DB', (done) => {
    chai.request(server).get('/crop/20')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(res.status).to.equal(200);
        //chai_expect(res.body[0]).to.deep.equal(dummy.cropResponse);
        done();
      });
  });

  test('POST a new crop with farm id', (done) => {
    let crop = dummy.mockCrop;
    crop.farm_id = farm_id;
    chai.request(server).post('/crop')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(crop)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('crop_common_name');
        chai.expect(res.body).to.have.property('crop_id');
        chai.expect(res.body.crop_common_name).to.equal('Tide pods');
        crop_id = parseInt(res.body.crop_id);
        done();
      });
  });

  test('PUT update a field(fe) in the new crop Tide pods', (done) => {
    let crop = dummy.mockCrop;
    crop.farm_id = farm_id;
    crop.fe = 9.11;
    chai.request(server).put('/crop/' + crop_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .send(crop)
      .end((err, res) => {
        chai_expect(res.status).to.equal(200);
        chai.expect(res.body[0]).to.have.property('fe');
        chai.expect(res.body[0].fe).to.equal(9.11);
        done();
      });
  });

  test('DELETE custom crop should get 200' , (done) => {
    chai.request(server).del('/crop/' + crop_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('DELETE default crop should get 404' , (done) => {
    chai.request(server).del('/crop/20')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(404);
        done();
      });
  });

  /************* delete stuff that was created in this test *************/

  test('GET bed should get 404' , (done) => {
    chai.request(server).get('/bed/' + bed_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer '+token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(404);
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

  test('GET field should get 404' , (done) => {
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
