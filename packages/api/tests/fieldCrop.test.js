/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farm.test.js) is part of LiteFarm.
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
const moment =require('moment')
chai.use(chaiHttp);
const chai_assert = chai.assert;    // Using Assert style
const chai_expect = chai.expect;    // Using Expect style
const chai_should = chai.should();  // Using Should style
const server = require('./../src/server');
const dummy = require('./dummy');
const sinon = require('sinon')
const Knex = require('knex')
const environment = 'test';
const config = require('../knexfile')[environment];
const knex = Knex(config);
let checkJwt;
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks  = require('./mock.factories');

const userModel = require('../src/models/userModel');
const farmModel = require('../src/models/farmModel');
const fieldModel = require('../src/models/fieldModel');
const cropModel = require('../src/models/cropModel');
const fieldCropModel = require('../src/models/fieldCropModel');

describe('FieldCrop Tests', () => {
  let middleware;
  let newOwner;
  let newManager;
  let newWorker;
  let newUnregisteredWorker;
  let newUser;
  let crop;
  let field;
  let farm;
  let farmNewUser;
  let fieldCrop;
  let cropNotInUse;
  beforeAll(() => {
    token = global.token;
  });

  function postFieldCropRequest( data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id) {
    chai.request(server).post('/field_crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function postCropRequest( data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id) {
    chai.request(server).post('/crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest(url, callback,user_id = newOwner.user_id, farm_id = farm.farm_id) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function putFieldCropRequest(data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id, field_crop_id = fieldCrop.field_crop_id) {
    chai.request(server).put(`/field_crop/${field_crop_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function deleteRequest(url, callback,user_id = newOwner.user_id, farm_id = farm.farm_id) {
    chai.request(server).delete(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }
  function fakeFieldCrop(){
    const fieldCrop = mocks.fakeFieldCrop();
    const area_used = fieldCrop.area_used < field.area?  fieldCrop.area_used: field.area;
    return ({...fieldCrop, crop_id: crop.crop_id, field_id: field.field_id, area_used});
  }
  function fakeCrop(farm_id = farm.farm_id){
    const crop = mocks.fakeCrop();
    return ({...crop, farm_id});
  }

  const later = async (delay) =>
    new Promise(resolve => setTimeout(resolve, delay));

  beforeEach(async () => {
    await knex.raw(`
    DELETE FROM "fieldCrop";
    DELETE FROM "field";
    DELETE FROM "userFarm";
    DELETE FROM "crop";
    DELETE FROM "farm";
    DELETE FROM "users";
    DELETE FROM "weather_station";
    `);
    [newOwner] = await mocks.usersFactory();
    [newManager] = await mocks.usersFactory();
    [newWorker] = await mocks.usersFactory();
    [newUnregisteredWorker] = await mocks.usersFactory();
    [newUser] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    [farmNewUser] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({promisedUser:[newOwner], promisedFarm:[farm]},fakeUserFarm(1));
    const [managerFarm] = await mocks.userFarmFactory({promisedUser:[newManager], promisedFarm:[farm]},fakeUserFarm(2));
    const [workerFarm] = await mocks.userFarmFactory({promisedUser:[newWorker], promisedFarm:[farm]},fakeUserFarm(3));
    const [unRegisteredWorkerFarm] = await mocks.userFarmFactory({promisedUser:[newUnregisteredWorker], promisedFarm:[farm]},fakeUserFarm(4));
    const [ownerFarmNewUser] = await mocks.userFarmFactory({promisedUser:[newUser], promisedFarm:[farmNewUser]},fakeUserFarm(1));
    [crop] = await mocks.cropFactory({promisedFarm:[farm]},{...mocks.fakeCrop(), crop_common_name: "crop", user_added: true});
    [cropNotInUse] = await mocks.cropFactory({},{...mocks.fakeCrop(), crop_common_name: "cropNotInUse", user_added: true});
    [field] = await mocks.fieldFactory({promisedFarm:[farm]});
    [fieldCrop] = await mocks.fieldCropFactory({promisedField: [field], promisedCrop: [crop]});

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
  })

  afterEach (async () => {
    await knex.raw(`
    DELETE FROM "fieldCrop";
    DELETE FROM "field";
    DELETE FROM "userFarm";
    DELETE FROM "crop";
    DELETE FROM "farm";
    DELETE FROM "users";
    DELETE FROM "weather_station";
    `);
    const test = 0;
  });

  describe('Post fieldCrop', ()=>{
    test('Workers should get fieldCrop by id', async (done)=>{
      getRequest(`/field_crop/${fieldCrop.field_crop_id}`,(err,res)=>{
        console.log(res.error,res.body);
        expect(res.status).toBe(200);
        expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
        done();
      },newWorker.user_id);
    })

    test('should return 400 status if fieldCrop is posted w/o crop_id', async (done) => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.crop_id;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_id[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o area_used', async (done) => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.area_used;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_revenue', async (done) => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.estimated_revenue;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_production', async (done) => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.estimated_production;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_production[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area > field.area', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.area_used = field.area + 1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Area needed is greater than the field\'s area');
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area < 0', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.area_used = -1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get a valid fieldcrop (bed size and percentage)', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(201);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.field_id).toBe(field.field_id);
        done();
      })
    });

    test('should return 400 status if fieldCrop is posted w/ estimated_revenue < 0', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = -1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get an expired crop', async (done) => {
      const { ref } = require('objection');
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      fieldCrop.start_date = moment().subtract(50,'d').toDate();
      fieldCrop.end_date = moment().subtract(20,'d').toDate();
      postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(201);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.field_id).toBe(field.field_id);
        done();
      })
    });
  })

  describe('Post fieldCrop authorization',()=>{
    test('Should return status 403 when a worker tries to post a valid fieldcrop', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, (err, res) => {
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(403);
          done()
        },
        newWorker.user_id)
    });

    test('Should return status 403 when an unauthorized user tries to post a valid fieldcrop', async (done) => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, (err, res) => {
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(403);
          done()
        },
        newUser.user_id)
    });
  });

  describe('Post crop', () => {

    test('should return 400 status if crop is posted w/o crop_common_name', async (done) => {
      let crop = fakeCrop();
      delete crop.crop_common_name;
      postCropRequest(crop, (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_common_name[0].keyword).toBe("required");
        done()
      })
    });

    test('should post and get a valid crop', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(201);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(2);
        expect(crops[1].crop_common_name).toBe(crop.crop_common_name);
        done();
      })
    });

    test('should return 403 status if crop is posted by unauthorized user', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      postCropRequest(crop, (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:crops");
        done()
      }, newUser.user_id)
    });

    test('should return 403 status if crop is posted by newWorker', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      postCropRequest(crop, (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:crops");
        done()
      }, newWorker.user_id)
    });

  });

  describe('crop_common_name + genus + species uniqueness tests', function(){
    test('should return 400 status if crop is posted w/o variety name', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      [crop] = await mocks.cropFactory({promisedFarm:[farm]},crop);
      postCropRequest(crop, (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.routine).toBe("_bt_check_unique");
        done();
      })
    });

    test('should post a crop and its variety', async (done) => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      const [crop1] = await mocks.cropFactory({promisedFarm:[farm]},crop);
      crop.crop_common_name += ' - 1';
      postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(201);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(3);
        expect(crops[1].crop_common_name).toBe(crop1.crop_common_name);
        expect(crops[2].crop_common_name).toBe(crop.crop_common_name);
        done();
      })
    });
  })

  describe('Delete fieldCrop', function () {

    test('should delete a fieldCrop', async (done) => {
      deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, async (err, res) => {
        console.log(fieldCrop.deleted,res.error);
        expect(res.status).toBe(200);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(0);
        done();
      })
    });

    test('should return 403 if an unauthorized user tries to delete a fieldCrop', async (done) => {
      deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        done();
      }, newUser.user_id)
    });

    test('should return 403 if a worker tries to delete a fieldCrop', async (done) => {
      deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, (err, res) => {
        console.log(fieldCrop,res.error, res.body);
        expect(res.status).toBe(403);
        done();
      }, newWorker.user_id)
    });
  });

  describe('Delete crop', function () {
    // TODO check intended behavior;
    test('should delete a crop that is referenced by a fieldCrop', async (done) => {
      deleteRequest(`/crop/${crop.crop_id}`, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(200);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(0);
        done();
      })
    });

    test('should delete a crop that is not in use', async (done) => {
      deleteRequest(`/crop/${cropNotInUse.crop_id}`, async (err, res) => {
        console.log(cropNotInUse,res.error);
        expect(res.status).toBe(200);
        const crops = await cropModel.query().where('farm_id',farm.farm_id);
        expect(crops.length).toBe(0);
        done();
      })
    });

    test('should return 403 if unauthorized user tries to delete a crop that is not in use', async (done) => {
      //TODO User can circumvent authorization by setting user_id and farm_id in header
      deleteRequest(`/crop/${cropNotInUse.crop_id}`, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        done();
      }, newUser.user_id)
    });

    test('should return 403 if a worker tries to delete a crop that is not in use', async (done) => {
      deleteRequest(`/crop/${cropNotInUse.crop_id}`, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        done();
      }, newWorker.user_id)
    });
  });

  describe('Put fieldCrop', ()=>{
    test('should edit and the area_used field', async (done) => {
      fieldCrop.area_used = field.area * 0.1;
      putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(Math.floor(newFieldCrop.area_used)).toBe(Math.floor(fieldCrop.area_used));
        done();
      })
    });

    test('should edit and the estimated_production field', async (done) => {
      fieldCrop.estimated_production = 1;
      putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.estimated_production).toBe(1);
        done();
      })
    });

    test('should edit and the estimated_revenue field', async (done) => {
      fieldCrop.estimated_revenue = 1;
      putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.estimated_revenue).toBe(1);
        done();
      })
    });

    test('Expired route should filter out non-expired fieldCrop', async (done) => {
      fieldCrop.end_date = moment().add(10,'d').toDate();
      await mocks.fieldCropFactory({},fieldCrop);
      getRequest(`/field_crop/expired/farm/${farm.farm_id}`,(err,res)=>{
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        done()
      });
    });

    test('should change the end_date to a future date', async (done) => {
      fieldCrop.end_date = moment().add(10,'d').toDate();
      putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.end_date).toBe(fieldCrop.end_date);
        done();
      })
    });

    test('should change the end_date to a historical date', async (done) => {
      fieldCrop.end_date = moment().subtract(10,'d').toDate();
      putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        const newFieldCrop = await fieldCropModel.query().where('crop_id',crop.crop_id).first();
        expect(newFieldCrop.end_date).toBe(fieldCrop.end_date);
        done();
      })
    });

    test('Expired route should not filter out non-expired fieldCrop', async (done) => {
      fieldCrop.end_date = moment().subtract(10,'d').toDate();
      await mocks.fieldCropFactory({},fieldCrop);
      getRequest(`/field_crop/expired/farm/${farm.farm_id}`,(err,res)=>{
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        done()
      });
    });

    test('should return 403 when unauthorized user tries to edit fieldCrop', async (done) => {
      fieldCrop.estimated_revenue = 1;
      putFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        done();
      }, newUser.user_id);
    });

    test('should return 403 when a worker tries to edit fieldCrop', async (done) => {
      fieldCrop.estimated_revenue = 1;
      putFieldCropRequest(fieldCrop, (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        done();
      }, newWorker.user_id);
    });

  });
});
