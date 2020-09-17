/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightsAPI.test.js) is part of LiteFarm.
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
//const nitrogenBalance = require('../src/jobs/nitrogenBalance/nitrogenBalance');

beforeAll(() => {
  // beforeAll is set before each test
  // global.token is set in testEnvironment.js
  token = global.token;
});

xdescribe('Testing Insights People Fed API', () => {

  let farm_id = null;
  let sale_id;
  let field_crop_id;
  let field_id;
  let crop_id;

  test('POST farm happy land to DB to setup test', (done) => {
    chai.request(server).post('/farm')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(dummy.mockFarm)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('farm_id');
        farm_id = res.body.farm_id;
        done();
      });
  });

  test('POST a new crop with farm id', (done) => {
    let crop = dummy.mockCrop;
    crop.farm_id = farm_id;
    chai.request(server).post('/crop')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
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

  test('POST a field to DB', (done) => {
    let field = dummy.mockField;
    field.farm_id = farm_id;
    chai.request(server).post('/field')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(field)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('field_id');
        field_id = res.body.field_id;
        done();
      });
  });

  test('POST fieldCrop to DB to setup test', (done) => {
    chai.request(server).post('/field_crop')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({field_id, crop_id})
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('field_crop_id');
        field_crop_id = res.body.field_crop_id;
        done();
      });
  });

  test('POST sale and cropSale', (done) => {
    const mockSaleAndCropSale = Object.assign(dummy.mockSaleAndCropSale, { farm_id, cropSale: { crop_id }});
    chai.request(server).post('/sale')
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(mockSaleAndCropSale)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(201);
        chai.expect(res.body).to.have.property('sale_id');
        sale_id = res.body.sale_id;
        done();
      });
  });

  test('GET People Fed with farm_id from DB', (done) => {
    chai.request(server).get('/insight/people_fed/' + farm_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        chai_expect(res.body.data.length).to.equal(5);
        chai_expect(res.body.preview).to.equal(0);
        done();
      });
  });

  test('DELETE sale and cropSale', (done) => {
    chai.request(server).del('/sale/' + sale_id)
      .set('content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('DELETE fieldCrop that was associated to this test', (done) => {
    chai.request(server).del('/field_crop/' + field_crop_id)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      });
  });

  test('DELETE field associated to this test', (done) => {
    chai.request(server).del('/field/' + field_id)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      })
  });

  test('DELETE crop associated to this test', (done) => {
    chai.request(server).del('/crop/' + crop_id)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .end((err, res) => {
        chai_expect(err).to.be.null;
        chai_expect(res.status).to.equal(200);
        done();
      })
  });
});
