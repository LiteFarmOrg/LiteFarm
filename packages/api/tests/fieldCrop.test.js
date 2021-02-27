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
const moment = require('moment')
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment')
jest.mock('jsdom')
jest.mock('../src/middleware/acl/checkJwt')
const mocks = require('./mock.factories');

const fieldCropModel = require('../src/models/fieldCropModel');

xdescribe('FieldCrop Tests', () => {
  let middleware;
  let owner;
  let field;
  let farm;
  let farmunAuthorizedUser;

  beforeAll(() => {
    token = global.token;
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  })

  function postFieldCropRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).post('/field_crop')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).get(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function putFieldCropRequest(data, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    const { field_crop_id } = data;
    chai.request(server).put(`/field_crop/${field_crop_id}`)
      .set('farm_id', farm_id)
      .set('user_id', user_id)
      .send(data)
      .end(callback)
  }

  function deleteRequest(url, { user_id = owner.user_id, farm_id = farm.farm_id }, callback) {
    chai.request(server).delete(url)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback)
  }

  function fakeUserFarm(role = 1) {
    return ({ ...mocks.fakeUserFarm(), role_id: role });
  }

  function fakeFieldCrop(crop) {
    const fieldCrop = mocks.fakeFieldCrop();
    const area_used = fieldCrop.area_used < field.area ? fieldCrop.area_used : field.area;
    return ({ ...fieldCrop, crop_id: crop.crop_id, field_id: field.field_id, area_used });
  }

  beforeEach(async () => {
    [owner] = await mocks.usersFactory();
    [farm] = await mocks.farmFactory();
    const [ownerFarm] = await mocks.userFarmFactory({
      promisedUser: [owner],
      promisedFarm: [farm]
    }, fakeUserFarm(1));
    [field] = await mocks.fieldFactory({ promisedFarm: [farm] });

    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next()
    });
  })

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Get && delete && put fieldCrop', () => {
    let fieldCrop;
    let worker;
    let workerFarm;
    let crop;
    let unAuthorizedUser;
    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] }, {
        ...mocks.fakeCrop(),
        crop_common_name: "crop",
        user_added: true
      });
      [fieldCrop] = await mocks.fieldCropFactory({ promisedField: [field], promisedCrop: [crop] });
      [worker] = await mocks.usersFactory();
      [workerFarm] = await mocks.userFarmFactory({ promisedUser: [worker], promisedFarm: [farm] }, fakeUserFarm(3));

      [unAuthorizedUser] = await mocks.usersFactory();
      [farmunAuthorizedUser] = await mocks.farmFactory();
      const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
        promisedUser: [unAuthorizedUser],
        promisedFarm: [farmunAuthorizedUser]
      }, fakeUserFarm(1));

    })


    describe('Get fieldCrop', () => {
      test('Workers should get fieldCrop by farm id', async (done) => {
        getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
          done();
        });
      })

      test('Workers should get fieldCrop by date', async (done) => {
        getRequest(`/field_crop/farm/date/${farm.farm_id}/${moment().format('YYYY-MM-DD')}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
          done();
        });
      })

      test('Workers should get fieldCrop by id', async (done) => {
        getRequest(`/field_crop/${fieldCrop.field_crop_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
          done();
        });
      })

      describe('Get fieldCrop authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm]
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })

        test('Owner should get fieldCrop by farm id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: owner.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
            done();
          });
        })

        test('Manager should get fieldCrop by farm id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: manager.user_id }, (err, res) => {
            expect(res.status).toBe(200);
            expect(res.body[0].field_crop_id).toBe(fieldCrop.field_crop_id);
            done();
          });
        })

        test('Should get status 403 if an unauthorizedUser tries to get fieldCrop by farm id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        })

        test('Circumvent authorization by modifying farm_id', async (done) => {
          getRequest(`/field_crop/farm/${farm.farm_id}`, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        })


      })
    })


    describe('Delete fieldCrop', function () {

      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [worker],
          promisedFarm: [farm]
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm]
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser]
        }, fakeUserFarm(1));
      })

      test('should delete a fieldCrop by owner', async (done) => {
        deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const fieldCropRes = await fieldCropModel.query().context({showHidden: true}).where('field_crop_id', fieldCrop.field_crop_id);
          expect(fieldCropRes.length).toBe(1);
          expect(fieldCropRes[0].deleted).toBe(true);
          done();
        })
      });

      test('should delete a fieldCrop by manager', async (done) => {
        deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const fieldCropRes = await fieldCropModel.query().context({showHidden: true}).where('field_crop_id', fieldCrop.field_crop_id);
          expect(fieldCropRes.length).toBe(1);
          expect(fieldCropRes[0].deleted).toBe(true);
          done();
        })
      });

      test('should return 403 if an unauthorized user tries to delete a fieldCrop', async (done) => {
        deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, { user_id: unAuthorizedUser.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('should return 403 if a worker tries to delete a fieldCrop', async (done) => {
        deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, { user_id: worker.user_id }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });

      test('Circumvent authorization by modifying farm_id', async (done) => {
        deleteRequest(`/field_crop/${fieldCrop.field_crop_id}`, {
          user_id: unAuthorizedUser.user_id,
          farm_id: farmunAuthorizedUser.farm_id
        }, (err, res) => {
          expect(res.status).toBe(403);
          done();
        })
      });
    });

    describe('Put fieldCrop', () => {
      test('should be able to edit the area_used field', async (done) => {
        fieldCrop.area_used = field.area * 0.1;
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(Math.floor(newFieldCrop.area_used)).toBe(Math.floor(fieldCrop.area_used));
          done();
        })
      });

      test('should return status 400 and if area_used is bigger than the field', async (done) => {
        fieldCrop.area_used = field.area + 1;
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(400);
          expect(res.error.text).toBe('Area needed is greater than the field\'s area');
          done();
        })
      });

      test('should edit and the estimated_production field', async (done) => {
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.estimated_production = 1;
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(newFieldCrop.estimated_production).toBe(1);
          done();
        })
      });

      test('should edit and the estimated_revenue field', async (done) => {
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.estimated_revenue = 1;
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(newFieldCrop.estimated_revenue).toBe(1);
          done();
        })
      });

      test('Expired route should filter out non-expired fieldCrop', async (done) => {
        let fieldCrop = mocks.fakeFieldCrop();
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.end_date = moment().add(10, 'd').toDate();
        await mocks.fieldCropFactory({}, fieldCrop);
        getRequest(`/field_crop/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(0);
          done()
        });
      });

      test('should change the end_date to a future date', async (done) => {
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.end_date = moment().add(10, 'd').toDate();
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(newFieldCrop.end_date.toDateString()).toBe(fieldCrop.end_date.toDateString());
          done();
        })
      });

      test('should change the end_date to a historical date', async (done) => {
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.end_date = moment().subtract(10, 'd').toDate();
        putFieldCropRequest(fieldCrop, {}, async (err, res) => {
          expect(res.status).toBe(200);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(newFieldCrop.end_date.toDateString()).toBe(fieldCrop.end_date.toDateString());
          done();
        })
      });

      test('Expired route should not filter out non-expired fieldCrop', async (done) => {
        let fieldCrop = mocks.fakeFieldCrop();
        fieldCrop.area_used = field.area * 0.1;
        fieldCrop.end_date = moment().subtract(10, 'd').toDate();
        await mocks.fieldCropFactory({ promisedCrop: [crop], promisedField: [field] }, fieldCrop);
        getRequest(`/field_crop/expired/farm/${farm.farm_id}`, {}, (err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          done()
        });
      });

      describe('Put fieldCrop authorization tests', () => {
        let worker;
        let manager;
        let unAuthorizedUser;
        let farmunAuthorizedUser;

        beforeEach(async () => {
          [worker] = await mocks.usersFactory();
          const [workerFarm] = await mocks.userFarmFactory({
            promisedUser: [worker],
            promisedFarm: [farm]
          }, fakeUserFarm(3));
          [manager] = await mocks.usersFactory();
          const [managerFarm] = await mocks.userFarmFactory({
            promisedUser: [manager],
            promisedFarm: [farm]
          }, fakeUserFarm(2));


          [unAuthorizedUser] = await mocks.usersFactory();
          [farmunAuthorizedUser] = await mocks.farmFactory();
          const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
            promisedUser: [unAuthorizedUser],
            promisedFarm: [farmunAuthorizedUser]
          }, fakeUserFarm(1));
        })
        //TODO: Owner test
        test('should edit and the area_used field by manager', async (done) => {
          fieldCrop.area_used = field.area * 0.1;
          putFieldCropRequest(fieldCrop, { user_id: manager.user_id }, async (err, res) => {
            expect(res.status).toBe(200);
            const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
            expect(Math.floor(newFieldCrop.area_used)).toBe(Math.floor(fieldCrop.area_used));
            done();
          })
        });

        test('should return 403 when unauthorized user tries to edit fieldCrop', async (done) => {
          fieldCrop.estimated_revenue = 1;
          putFieldCropRequest(fieldCrop, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('should return 403 when a worker tries to edit fieldCrop', async (done) => {
          fieldCrop.estimated_revenue = 1;
          putFieldCropRequest(fieldCrop, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

        test('Circumvent authorization by modifying farm_id', async (done) => {
          fieldCrop.estimated_revenue = 1;
          putFieldCropRequest(fieldCrop, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done();
          });
        });

      })
    });


  })

  describe('Post fieldCrop', () => {
    let crop;

    beforeEach(async () => {
      [crop] = await mocks.cropFactory({ promisedFarm: [farm] }, {
        ...mocks.fakeCrop(),
        crop_common_name: "crop",
        user_added: true
      });
    })

    test('should return 400 status if fieldCrop is posted w/o crop_id', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      delete fieldCrop.crop_id;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.crop_id[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o area_used', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      delete fieldCrop.area_used;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_revenue', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      delete fieldCrop.estimated_revenue;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/o estimated_production', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      delete fieldCrop.estimated_production;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_production[0].keyword).toBe("required");
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area > field.area', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      fieldCrop.area_used = field.area + 1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(res.error.text).toBe('Area needed is greater than the field\'s area');
        done()
      })
    });

    test('should return 400 status if fieldCrop is posted w/ area < 0', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      fieldCrop.area_used = -1;
      fieldCrop.estimated_production = 1;
      fieldCrop.estimated_revenue = 1;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.area_used[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get a valid fieldcrop (bed size and percentage)', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
        expect(newFieldCrop.field_id).toBe(field.field_id);
        done();
      })
    });

    test('should return 400 status if fieldCrop is posted w/ estimated_revenue < 0', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      fieldCrop.estimated_revenue = -1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      postFieldCropRequest(fieldCrop, {}, (err, res) => {
        expect(res.status).toBe(400);
        expect(JSON.parse(res.error.text).error.data.estimated_revenue[0].message).toBe("should be >= 0");
        done()
      })
    });

    test('Should post then get an expired crop', async (done) => {
      let fieldCrop = fakeFieldCrop(crop);
      fieldCrop.estimated_revenue = 1;
      fieldCrop.area_used = field.area * 0.25;
      fieldCrop.estimated_production = 1;
      fieldCrop.start_date = moment().subtract(50, 'd').toDate();
      fieldCrop.end_date = moment().subtract(20, 'd').toDate();
      postFieldCropRequest(fieldCrop, {}, async (err, res) => {
        expect(res.status).toBe(201);
        const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
        expect(newFieldCrop.field_id).toBe(field.field_id);
        done();
      })
    });

    describe('Post fieldCrop authorization', () => {
      let worker;
      let manager;
      let unAuthorizedUser;
      let farmunAuthorizedUser;

      beforeEach(async () => {
        [worker] = await mocks.usersFactory();
        const [workerFarm] = await mocks.userFarmFactory({
          promisedUser: [worker],
          promisedFarm: [farm]
        }, fakeUserFarm(3));
        [manager] = await mocks.usersFactory();
        const [managerFarm] = await mocks.userFarmFactory({
          promisedUser: [manager],
          promisedFarm: [farm]
        }, fakeUserFarm(2));


        [unAuthorizedUser] = await mocks.usersFactory();
        [farmunAuthorizedUser] = await mocks.farmFactory();
        const [ownerFarmunAuthorizedUser] = await mocks.userFarmFactory({
          promisedUser: [unAuthorizedUser],
          promisedFarm: [farmunAuthorizedUser]
        }, fakeUserFarm(1));
      })

      test('Should post then get a valid fieldcrop by a manager', async (done) => {
        let fieldCrop = fakeFieldCrop(crop);
        fieldCrop.estimated_revenue = 1;
        fieldCrop.area_used = field.area * 0.25;
        fieldCrop.estimated_production = 1;
        postFieldCropRequest(fieldCrop, { user_id: manager.user_id }, async (err, res) => {
          expect(res.status).toBe(201);
          const newFieldCrop = await fieldCropModel.query().context({showHidden: true}).where('crop_id', crop.crop_id).first();
          expect(newFieldCrop.field_id).toBe(field.field_id);
          done();
        })
      });

      test('Should return status 403 when a worker tries to post a valid fieldcrop', async (done) => {
        let fieldCrop = fakeFieldCrop(crop);
        fieldCrop.estimated_revenue = 1;
        fieldCrop.area_used = field.area * 0.25;
        fieldCrop.estimated_production = 1;
        postFieldCropRequest(fieldCrop, { user_id: worker.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

      test('Should return status 403 when an unauthorized user tries to post a valid fieldcrop', async (done) => {
        let fieldCrop = fakeFieldCrop(crop);
        fieldCrop.estimated_revenue = 1;
        fieldCrop.area_used = field.area * 0.25;
        fieldCrop.estimated_production = 1;
        postFieldCropRequest(fieldCrop, { user_id: unAuthorizedUser.user_id }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

      test('Circumvent authorization by modify farm_id', async (done) => {
        let fieldCrop = fakeFieldCrop(crop);
        fieldCrop.estimated_revenue = 1;
        fieldCrop.area_used = field.area * 0.25;
        fieldCrop.estimated_production = 1;
        postFieldCropRequest(fieldCrop, {
            user_id: unAuthorizedUser.user_id,
            farm_id: farmunAuthorizedUser.farm_id
          }, (err, res) => {
            expect(res.status).toBe(403);
            done()
          },
        )
      });

    });

  })

});
