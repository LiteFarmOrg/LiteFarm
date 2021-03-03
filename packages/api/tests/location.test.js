const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');
const mocks = require('./mock.factories');

const assetDict = {
  barn: 'area',
  greenhouse: 'area',
  field: 'area',
  natural_area: 'area',
  ceremonial_area: 'area',
  residence: 'area',
  ground_water: 'area',
  creek: 'line',
  fence: 'line',
  buffer_zone: 'line',
  gate: 'point',
  water_valve: 'point',
}
const assetMock = {
  barn: mocks.fakeArea,
  greenhouse: mocks.fakeArea,
  field: mocks.fakeArea,
  natural_area: mocks.fakeArea,
  ceremonial_area: mocks.fakeArea,
  residence: mocks.fakeArea,
  ground_water: mocks.fakeArea,
  creek: mocks.fakeLine,
  fence: mocks.fakeLine,
  buffer_zone: mocks.fakeLine,
  gate: mocks.fakePoint,
  water_valve: mocks.fakePoint,
}

const assetSpecificMock = {
  barn: mocks.fakeBarn,
  greenhouse: mocks.fakeGreenhouse,
  field: mocks.fakeField,
  natural_area: () => ({}),
  ceremonial_area: () => ({}),
  residence: () => ({}),
  ground_water: mocks.fakeGroundWater,
  creek: mocks.fakeCreek,
  fence: mocks.fakeFence,
  buffer_zone: () => ({}),
  gate: () => ({}),
  water_valve: mocks.fakeWaterValve,
}




describe('Location tests', () => {
  let middleware;
  beforeAll(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  function putLocation(data, { user_id, farm_id }, location, callback) {
    chai.request(server).put(`/location/${location}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }
  function postLocation(data, { user_id, farm_id }, callback) {
    chai.request(server).post('/location')
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback)
  }

  function getLocationsInFarm({ user_id, farm_id}, farm, callback) {
    chai.request(server)
      .get(`/location/farm/${farm}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function deleteLocation({user_id, farm_id}, location, callback){
    chai.request(server)
      .delete(`/location/${location}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  function appendFieldToFarm(farm_id, n = 1) {
    return Promise.all(
      [...Array(n)].map(() => mocks.fieldFactory({
        promisedLocation: mocks.locationFactory({ promisedFarm: [{ farm_id }] })
      }))
    );
  }

  function appendFenceToFarm(farm_id, n = 1) {
    return Promise.all(
      [...Array(n)].map(() => mocks.fenceFactory({
        promisedLocation: mocks.locationFactory({ promisedFarm: [{ farm_id }] })
      }))
    );

  }


  describe('GET /location by farm', () => {
    let user, farm;
    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, { status: 'Active', role_id: 1 });
      farm = farm_id;
      user = user_id;
    })

    test('should GET 2 fields linked to that farm', async (done) => {
      await appendFieldToFarm(farm, 2);
      getLocationsInFarm({user_id: user, farm_id: farm}, farm, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        res.body.map((field) => {
          expect(field.figure.type).toBe('field');
          expect(field.figure.area).not.toBe(null);
        })
        done();
      });
    });

    test('should only get locations linked to that farm', async (done) => {
      const [anotherUserFarm] = await mocks.userFarmFactory({ promisedUser: [{ user_id: user }]});
      await appendFieldToFarm(farm, 2);
      await appendFieldToFarm(anotherUserFarm.farm_id, 3);
      getLocationsInFarm({user_id: user, farm_id: farm}, farm, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        done();
      });
    });

    test('should not get locations from farms Im not part of', async (done) => {
      const [anotherUserFarm] = await mocks.userFarmFactory();
      await appendFieldToFarm(farm, 2);
      await appendFieldToFarm(anotherUserFarm.farm_id, 3);
      getLocationsInFarm({user_id: user, farm_id: farm}, anotherUserFarm.farm_id, (err, res) => {
        expect(res.status).toBe(403);
        done();
      });
    });

    test('should get 2 fields and 1 fence linked to that farm', async (done) => {
      await appendFieldToFarm(farm, 2);
      await appendFenceToFarm(farm, 1);
      getLocationsInFarm({ user_id: user, farm_id: farm}, farm, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);
        const typeSum = res.body.reduce((types, { figure }) => ({
          [figure.type]: types[figure.type] ? types[figure.type]++ : 1 ,
          ...types
        }), {})
        expect(typeSum.field).toBe(2);
        expect(typeSum.fence).toBe(1);
        done();
      });
    })
  });

  describe('DELETE /location ', () => {
    let user, farm;
    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, { status: 'Active', role_id: 1 });
      farm = farm_id;
      user = user_id;
    })

    test('should delete field', async (done) => {
      const [[field1], [field2]] = await appendFieldToFarm(farm, 2);
      deleteLocation({user_id: user, farm_id: farm}, field1.location_id, async (err, res) => {
        expect(res.status).toBe(200);
        const location = await knex('location').where({ location_id: field1.location_id }).first();
        const location2 = await knex('location').where({ location_id: field2.location_id }).first();
        expect(location.deleted).toBeTruthy();
        expect(location2.deleted).toBeFalsy();
        done();
      });
    })
  })


  describe('POST /location', () => {
    let user, farm;

    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, { status: 'Active', role_id: 1 });
      farm = farm_id;
      user = user_id;
    });

    function locationData(asset) {
      return {
        ...mocks.fakeLocation(),
        figure: {
          type: asset,
          [assetDict[asset]]: assetMock[asset](false)
        },
        [asset]: assetSpecificMock[asset]()
      }
    }

    test('should create a location', (done) => {
      const data = locationData('barn');
      postLocation({...data, farm_id: farm},
        {user_id: user, farm_id: farm}, (err, res) => {
        expect(res.status).toBe(200);
        done();
      })
    })

    Object.keys(assetDict).map((asset) => {
        test(`should create a ${asset}`, (done) => {
          const data = locationData(asset);
          postLocation({...data, farm_id: farm},
            {user_id: user, farm_id: farm}, (err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.name).toBe(data.name);
              expect(res.body.figure.type).toBe(asset);
              expect(res.body[asset]).toBeDefined();
              done();
          })
      })
    })
  });

  describe('PUT /location' , () => {
    let user, farm;

    beforeEach(async () => {
      let [{ user_id, farm_id }] = await mocks.userFarmFactory({}, { status: 'Active', role_id: 1 });
      farm = farm_id;
      user = user_id;
    });



    test('should update a field', async (done) => {
      const location = await mocks.locationFactory({promisedFarm: [{ farm_id: farm }]})
      const area = await mocks.areaFactory({ promisedLocation: location});
      const field = await mocks.fieldFactory({ promisedLocation: location, promisedArea: area });
      const [{ location_id, created_by_user_id, updated_by_user_id, created_at, updated_at,  ...locationData }] = location;
      const [{station_id, ...fieldData}] = field;
      const data = {
        ...locationData,
        name: 'Test Name323',
        figure: {
          type: 'field',
          location_id: location_id,
          figure_id: area[0].figure_id,
          area: area[0]
        },
        field: {
          ...fieldData,
          organic_status: 'Non-Organic'
        }
      }
      putLocation(data, {user_id: user, farm_id: farm}, location[0].location_id, (err, res) => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Test Name323');
        expect(res.body.figure.type).toBe('field');
        expect(res.body.field.organic_status).toBe('Non-Organic');
        done();
      })
    })

  })


});
