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
const request = require("supertest");
const moment =require('moment')
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

  async function postFieldCropRequest( data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id) {
    const res = await request(server).post('/field_crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
    return await callback(null,res);
  }

  async function postCropRequest( data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id) {
    const res = await request(server).post('/crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
    return await callback(null,res);
  }

  async function getRequest(url, callback,user_id = newOwner.user_id, farm_id = farm.farm_id) {
    const res = await request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
    return await callback(null,res);
  }

  async function putFieldCropRequest(data, callback, user_id = newOwner.user_id, farm_id = farm.farm_id, field_crop_id = fieldCrop.field_crop_id) {
    const res = await request(server).put(`/field_crop/${field_crop_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
    return await callback(null,res);
  }

  async function deleteRequest(url, callback,user_id = newOwner.user_id, farm_id = farm.farm_id) {
    const res = await request(server).delete(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
    return await callback(null,res);
  }

  function fakeUserFarm(role=1){
    return ({...mocks.fakeUserFarm(),role_id:role});
  }
  function fakeFieldCrop(){
    const fieldCrop = mocks.fakeFieldCrop();
    const area_used = fieldCrop.area_used < field.area?  fieldCrop.area_used: field.area;
    return ({...fieldCrop, crop_id: crop.crop_id, field_id: field.field_id, area_used});
  }

  const later = async (delay) =>
    new Promise(resolve => setTimeout(resolve, delay));

  function fakeCrop(farm_id = farm.farm_id){
    const crop = mocks.fakeCrop();
    return ({...crop, farm_id});
  }

  beforeEach(async () => {
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
    [crop] = await mocks.cropFactory({promisedFarm:[farm]},{...mocks.fakeCrop(), crop_common_name: "crop"});
    [cropNotInUse] = await mocks.cropFactory({},{...mocks.fakeCrop(), crop_common_name: "cropNotInUse"});
    [field] = await mocks.fieldFactory({promisedFarm:[farm]});
    [fieldCrop] = await mocks.fieldCropFactory({promisedField: [field], promisedCrop: [crop]});
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.sub = '|' + req.get('user_id');
      next()
    });
    await later(500);
  })

  afterEach(async () => {
    await knex.raw(`
    DELETE FROM "fieldCrop";
    DELETE FROM "field";
    DELETE FROM "userFarm";
    DELETE FROM "crop";
    DELETE FROM "farm";
    DELETE FROM "users";
    DELETE FROM "weather_station";
    `);
    await later(500);
  });

  describe('Post fieldCrop', ()=>{
    test('should return 400 status if fieldCrop is posted w/o crop_id', async () => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.crop_id;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_id[0].keyword).toBe("required");
      })
    });

    test('should return 400 status if fieldCrop is posted w/o area_used', async () => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.area_used;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].keyword).toBe("required");
        
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_revenue', async () => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.estimated_revenue;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].keyword).toBe("required");
        
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_production', async () => {
      let fieldCrop = fakeFieldCrop();
      delete fieldCrop.estimated_production;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_production[0].keyword).toBe("required");
        
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area > field.area', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.area_used = field.area + 1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Area needed is greater than the field\'s area');
        
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area < 0', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.area_used = -1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].message).toBe("should be >= 0");
        
      })
    });

    test('Should post then get a valid fieldcrop (bed size and percentage)', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(201);
        await getRequest(`/field_crop/farm/${farm.farm_id}`,async (err, res)=>{
          expect(res.status).toBe(200);
          expect(res.body[0].field_id).toBe(fieldCrop.field_id);
          expect(res.body[0].crop_id).toBe(fieldCrop.crop_id);
          
        })
      })
    });

    test('should return 400 status if fieldCrop is posted w/ estimated_revenue < 0', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = -1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].message).toBe("should be >= 0");
        
      })
    });

    test('Should post then get an expired crop', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      fieldCrop.start_date = moment().subtract(50,'d').toDate();
      fieldCrop.end_date = moment().subtract(20,'d').toDate();
      await postFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(201);
        await getRequest(`/field_crop/expired/farm/${farm.farm_id}`,async (err, res)=>{
          //TODO Should /field_drop/farm/id return expired field_crops?
          expect(res.status).toBe(200);
          expect(res.body[0].field_id).toBe(fieldCrop.field_id);
          expect(res.body[0].crop_id).toBe(fieldCrop.crop_id);
          
        })
      })
    });
  })

  describe('Post fieldCrop authorization',()=>{
    test('Should return status 403 when an unauthorized user tries to post a valid fieldcrop', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(403);
          
        },
        newUser.user_id)
    });

    test('Should return status 403 when a worker tries to post a valid fieldcrop', async () => {
      let fieldCrop = fakeFieldCrop();
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      await postFieldCropRequest(fieldCrop, async (err, res) => {
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(403);

        },
        newWorker.user_id)
    });
  });

  describe('Post crop1',()=>{
    test('should post and get a valid crop', async () => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      await postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(201);
        await getRequest(`/crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(crop,res.body);
          expect(res.status).toBe(200);
          expect(res.body[2].crop_common_name).toBe(crop.crop_common_name);

        })
      })
    });
  })

  describe('Post crop', () => {

    test('should return 400 status if crop is posted w/o crop_common_name', async () => {
      let crop = fakeCrop();
      delete crop.crop_common_name;
      await postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_common_name[0].keyword).toBe("required");
      })
    });

    test('should return 400 status if crop is posted w/o variety name', async () => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      await postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(201);
        await postCropRequest(crop, async (err, res) => {
          console.log(crop,res.error);
          expect(res.status).toBe(400);
          expect(JSON.parse(res.error.text).error.routine).toBe("_bt_check_unique");
        })
      })
    });



    test('should return 403 status if crop is posted by unauthorized user', async () => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      await postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:crops");
        
      }, newUser.user_id)
    });

    test('should return 403 status if crop is posted by newWorker', async () => {
      let crop = fakeCrop();
      crop.crop_common_name = `${crop.crop_specie} - ${crop.crop_genus}`;
      await postCropRequest(crop, async (err, res) => {
        console.log(crop,res.error);
        expect(res.status).toBe(403);
        expect(res.error.text).toBe("User does not have the following permission(s): add:crops");

      }, newWorker.user_id)
    });

  });

  describe('Delete crop1', ()=>{
    test('should return 400 when a crop in use is deleted', async () => {
      await deleteRequest(`/crop/${crop.crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(400);
        await getRequest(`/crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(2);

        });
      })
    });
  })

  describe('Delete crop', function () {

    test('should delete a crop that is not in use', async () => {
      await deleteRequest(`/crop/${cropNotInUse.crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          
        });
      })
    });

    test('should return 403 if unauthorized user tries to delete a crop that is not in use', async () => {
      await deleteRequest(`/crop/${cropNotInUse.crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        
      }, newUser.user_id)
    });


    test('should return 403 if a worker tries to delete a crop that is not in use', async () => {
      await deleteRequest(`/crop/${cropNotInUse.crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        
      }, newWorker.user_id)
    });
  });

  describe('Delete FieldCrop', ()=>{
    test('should delete a fieldCrop', async () => {
      await deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(0);

        });
      })
    });

    test('should return 403 if an unauthorized user tries to delete a fieldCrop', async () => {
      await deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);

      }, newUser.user_id)
    });

    test('should return 403 if a worker tries to delete a fieldCrop', async () => {
      await deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);

      }, newWorker.user_id)
    });
  })

  describe('Put fieldCrop', ()=>{
    test('should edit and the area_used field', async () => {
      fieldCrop.area_used = field.area * 0.1;
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(Math.floor(res.body[0].area_used)).toBe(Math.floor(fieldCrop.area_used));
          
        });
      })
    });

    test('should edit and the estimated_production field', async () => {
      fieldCrop.estimated_production = 1;
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body[0].estimated_production).toBe(1);
          
        });
      })
    });

    test('should edit and the estimated_revenue field', async () => {
      fieldCrop.estimated_revenue = 1;
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body[0].estimated_revenue).toBe(1);
          
        });
      })
    });

    test('should change the end_date to a future date', async () => {
      fieldCrop.end_date = moment().add(10,'d').toDate();
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/expired/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(0);
          
        });
      })
    });

    test('should change the end_date to a historical date', async () => {
      fieldCrop.end_date = moment().subtract(10,'d').toDate();
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(200);
        await getRequest(`/field_crop/expired/farm/${farm.farm_id}`,async (err,res)=>{
          console.log(fieldCrop,res.error);
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          
        });
      })
    });

    test('should return 403 when unauthorized user tries to edit fieldCrop', async () => {
      fieldCrop.estimated_revenue = 1;
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        
      }, newUser.user_id);
    });

    test('should return 403 when a worker tries to edit fieldCrop', async () => {
      fieldCrop.estimated_revenue = 1;
      await putFieldCropRequest(fieldCrop, async (err, res) => {
        console.log(fieldCrop,res.error);
        expect(res.status).toBe(403);
        
      }, newWorker.user_id);
    });

  });
});
