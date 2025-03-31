import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import server from './../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import {
  figureMapping as origFigureMapping,
  promiseMapper,
} from './../src/middleware/validation/location.js';
import { faker } from '@faker-js/faker';

const figureMapping = Object.keys(origFigureMapping)
  .filter((t) => t !== 'sensor')
  .reduce((prev, currElement) => {
    return { ...prev, [currElement]: origFigureMapping[currElement] };
  }, {});

const locations = {
  BARN: 'barn',
  GREENHOUSE: 'greenhouse',
  FIELD: 'field',
  GARDEN: 'garden',
  NATURAL_AREA: 'natural_area',
  CEREMONIAL_AREA: 'ceremonial_area',
  RESIDENCE: 'residence',
  SURFACEWATER: 'surface_water',
  WATERCOURSE: 'watercourse',
  FENCE: 'fence',
  BUFFER_ZONE: 'buffer_zone',
  GATE: 'gate',
  WATER_VALVE: 'water_valve',
};

const figureToPromise = {
  area: (promisedLocation, type) => mocks.areaFactory({ promisedLocation }, mocks.fakeArea(), type),
  line: (promisedLocation, type) => mocks.lineFactory({ promisedLocation }, mocks.fakeLine(), type),
  point: (promisedLocation, type) =>
    mocks.areaFactory({ promisedLocation }, mocks.fakePoint(), type),
};

const assetMock = {
  barn: mocks.fakeArea,
  greenhouse: mocks.fakeArea,
  field: mocks.fakeArea,
  garden: mocks.fakeArea,
  farm_site_boundary: mocks.fakeArea,
  natural_area: mocks.fakeArea,
  ceremonial_area: mocks.fakeArea,
  residence: mocks.fakeArea,
  surface_water: mocks.fakeArea,
  watercourse: mocks.fakeLine,
  fence: mocks.fakeLine,
  buffer_zone: mocks.fakeLine,
  gate: mocks.fakePoint,
  water_valve: mocks.fakePoint,
};

const assetSpecificMock = {
  barn: mocks.fakeBarn,
  greenhouse: mocks.fakeGreenhouse,
  field: mocks.fakeField,
  garden: mocks.fakeGarden,
  farm_site_boundary: () => ({}),
  natural_area: () => ({}),
  ceremonial_area: () => ({}),
  residence: () => ({}),
  surface_water: mocks.fakeSurfaceWater,
  watercourse: mocks.fakeWatercourse,
  fence: mocks.fakeFence,
  buffer_zone: () => ({}),
  gate: () => ({}),
  water_valve: mocks.fakeWaterValve,
};

describe('Location tests', () => {
  afterAll(async () => {
    await tableCleanup(knex);
    await knex.destroy();
  });

  function putLocation(data, { user_id, farm_id }, asset, location) {
    return chai
      .request(server)
      .put(`/location/${asset}/${location}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function postLocation(data, asset, { user_id, farm_id }) {
    return chai
      .request(server)
      .post(`/location/${asset}`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data);
  }

  function getLocationsInFarm({ user_id, farm_id }, farm) {
    return chai
      .request(server)
      .get(`/location/farm/${farm}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function deleteLocation({ user_id, farm_id }, location) {
    return chai
      .request(server)
      .delete(`/location/${location}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id);
  }

  function appendFieldToFarm(farm_id, n = 1) {
    return Promise.all(
      [...Array(n)].map(() =>
        mocks.fieldFactory({
          promisedLocation: mocks.locationFactory({ promisedFarm: [{ farm_id }] }),
        }),
      ),
    );
  }

  function appendFenceToFarm(farm_id, n = 1) {
    return Promise.all(
      [...Array(n)].map(() =>
        mocks.fenceFactory({
          promisedLocation: mocks.locationFactory({ promisedFarm: [{ farm_id }] }),
        }),
      ),
    );
  }

  describe('GET /location by farm', () => {
    let user, farm;
    beforeEach(async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      farm = farm_id;
      user = user_id;
    });

    test('should GET 2 fields linked to that farm', async () => {
      const result = await appendFieldToFarm(farm, 2);
      console.log(result);
      const res = await getLocationsInFarm({ user_id: user, farm_id: farm }, farm);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      res.body.map((field) => {
        expect(field.figure.type).toBe('field');
        expect(field.figure.area).not.toBe(null);
      });
    });

    test('should only get locations linked to that farm', async () => {
      const [anotherUserFarm] = await mocks.userFarmFactory({ promisedUser: [{ user_id: user }] });
      await appendFieldToFarm(farm, 2);
      await appendFieldToFarm(anotherUserFarm.farm_id, 3);
      const res = await getLocationsInFarm({ user_id: user, farm_id: farm }, farm);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    test('should not get locations from farms Im not part of', async () => {
      const [anotherUserFarm] = await mocks.userFarmFactory();
      await appendFieldToFarm(farm, 2);
      await appendFieldToFarm(anotherUserFarm.farm_id, 3);
      const res = await getLocationsInFarm(
        { user_id: user, farm_id: farm },
        anotherUserFarm.farm_id,
      );
      expect(res.status).toBe(403);
    });

    test('should get 2 fields and 1 fence linked to that farm', async () => {
      await appendFieldToFarm(farm, 2);
      await appendFenceToFarm(farm, 1);
      const res = await getLocationsInFarm({ user_id: user, farm_id: farm }, farm);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      const typeSum = res.body.reduce(
        (types, { figure }) => ({
          [figure.type]: types[figure.type] ? types[figure.type]++ : 1,
          ...types,
        }),
        {},
      );
      expect(typeSum.field).toBe(2);
      expect(typeSum.fence).toBe(1);
    });
  });

  describe('DELETE /location ', () => {
    const createTask = async (user_id, options) => {
      const fakeTask = mocks.fakeTask({
        owner_user_id: user_id,
        assignee_user_id: user_id,
        due_date: faker.date.future(),
        ...options,
      });

      const [{ task_id }] = await mocks.taskFactory(
        {
          promisedUser: [{ user_id }],
        },
        fakeTask,
      );

      return task_id;
    };
    const createManagementTask = async (user_id, planting_management_plan_id, options) => {
      const newTaskId = await createTask(user_id, options);
      await mocks.management_tasksFactory({
        promisedTask: [{ task_id: newTaskId }],
        promisedPlantingManagementPlan: [{ planting_management_plan_id }],
      });
    };

    const createLocationTask = async (user_id, location_id, options) => {
      const newTaskId = await createTask(user_id, options);
      await mocks.location_tasksFactory({
        promisedTask: [{ task_id: newTaskId }],
        promisedField: [{ location_id }],
      });
    };

    const createTransplantTask = async (
      user_id,
      farm_id,
      location_id,
      transplantTaskManagementPlanId,
      options,
    ) => {
      const [transplantMgtPlan] = await knex('planting_management_plan')
        .insert({
          ...mocks.fakePlantingManagementPlan({
            location_id,
            management_plan_id: transplantTaskManagementPlanId,
          }),
        })
        .returning('*');
      const task_id = await createTask(user_id, options);
      await mocks.transplant_taskFactory(
        { promisedTask: [{ task_id }] },
        { planting_management_plan_id: transplantMgtPlan.planting_management_plan_id },
      );
      const { management_plan_id } = transplantMgtPlan;
      return { management_plan_id };
    };

    const createPlantTask = async (user_id, planting_management_plan_id, options) => {
      const task_id = await createTask(user_id, options);
      await mocks.plant_taskFactory(
        { promisedTask: [{ task_id }] },
        { planting_management_plan_id },
      );
    };

    test('should delete field', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);
      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(200);
      const location = await knex('location').where({ location_id: field1.location_id }).first();
      const location2 = await knex('location').where({ location_id: field2.location_id }).first();
      expect(location.deleted).toBeTruthy();
      expect(location2.deleted).toBeFalsy();
    });

    test('Delete should return 400 when field is referenced by managementPlan (incomplete plant task)', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });
      await createPlantTask(user_id, planting_management_plan_id);

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('Delete should return 400 when field is referenced by managementPlan (wild crop location)', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('Delete should return 400 when field is referenced by managementPlan (completed transplant task)', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field2],
        promisedField: [field2],
      });
      await createPlantTask(user_id, planting_management_plan_id, { complete_date: '2022-02-22' });
      await createTransplantTask(user_id, farm_id, field2.location_id, management_plan_id, {
        complete_date: '2022-02-23',
      });
      await createTransplantTask(user_id, farm_id, field2.location_id, management_plan_id);

      await createTransplantTask(user_id, farm_id, field1.location_id, management_plan_id, {
        complete_date: '2022-02-24',
      });

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('should delete field when crop is transplanted to different field', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });
      await createPlantTask(user_id, planting_management_plan_id, { complete_date: '2022-02-22' });
      await createTransplantTask(user_id, farm_id, field1.location_id, management_plan_id, {
        complete_date: '2022-02-23',
      });

      await createTransplantTask(user_id, farm_id, field2.location_id, management_plan_id, {
        complete_date: '2022-02-24',
      });

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(200);
    });

    test('should delete field when all tasks are completed or abandoned and crop is transplanted to different field', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });
      await createPlantTask(user_id, planting_management_plan_id, { complete_date: '2022-02-22' });
      await createTransplantTask(user_id, farm_id, field1.location_id, management_plan_id, {
        complete_date: '2022-02-23',
      });

      await createTransplantTask(user_id, farm_id, field2.location_id, management_plan_id, {
        complete_date: '2022-02-24',
      });

      await createManagementTask(user_id, planting_management_plan_id, {
        abandon_date: '2022-02-22',
      });
      await createLocationTask(user_id, field1.location_id, { complete_date: '2022-02-22' });

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(200);
    });

    test('should return 400 when field is referenced by incomplete plant task', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });
      await createPlantTask(user_id, planting_management_plan_id);

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('should return 400 when field is referenced by incomplete transplant task', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field2],
        promisedField: [field2],
      });
      await createPlantTask(user_id, planting_management_plan_id);
      await createTransplantTask(user_id, farm_id, field1.location_id, management_plan_id);

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('should return 400 when field is referenced by incomplete location task', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field2],
        promisedField: [field2],
      });
      await createPlantTask(user_id, planting_management_plan_id, { complete_date: '2022-02-23' });

      await createLocationTask(user_id, field1.location_id);

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });

    test('should return 400 when field is referenced by incomplete management task', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      const [[field1], [field2]] = await appendFieldToFarm(farm_id, 2);

      const [
        { planting_management_plan_id, management_plan_id },
      ] = await mocks.planting_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [field1],
        promisedField: [field1],
      });
      await createPlantTask(user_id, planting_management_plan_id, { complete_date: '2022-02-22' });
      await createTransplantTask(user_id, farm_id, field2.location_id, management_plan_id, {
        complete_date: '2022-02-23',
      });

      await createManagementTask(user_id, planting_management_plan_id);

      const res = await deleteLocation({ user_id, farm_id }, field1.location_id);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /location', () => {
    let user, farm;

    beforeEach(async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      farm = farm_id;
      user = user_id;
    });

    function locationData(asset) {
      const typeMock = assetSpecificMock[asset]();
      if (['field', 'garden', 'greenhouse'].includes(asset)) {
        typeMock.organic_history = {
          organic_status: typeMock.organic_status,
          effective_date: '2021-01-01',
        };
      }
      return {
        ...mocks.fakeLocation(),
        figure: {
          type: asset,
          [figureMapping[asset]]: assetMock[asset](false),
        },
        [asset]: typeMock,
      };
    }

    describe('Authorization', () => {
      Object.keys(figureMapping).map((asset) => {
        test(`should allow owner to create a ${asset}`, async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory(
            {},
            { status: 'Active', role_id: 1 },
          );
          const data = locationData(asset);
          const res = await postLocation({ ...data, farm_id }, asset, { user_id, farm_id });
          expect(res.status).toBe(200);
          expect(res.body.name).toBe(data.name);
          expect(res.body.figure.type).toBe(asset);
          expect(res.body[asset]).toBeDefined();
        });

        test(`should allow manager to create a ${asset}`, async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory(
            {},
            { status: 'Active', role_id: 2 },
          );
          const data = locationData(asset);
          const res = await postLocation({ ...data, farm_id }, asset, { user_id, farm_id });
          expect(res.status).toBe(200);
          expect(res.body.name).toBe(data.name);
          expect(res.body.figure.type).toBe(asset);
          expect(res.body[asset]).toBeDefined();
        });

        test(`should allow EO to create a ${asset}`, async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory(
            {},
            { status: 'Active', role_id: 5 },
          );
          const data = locationData(asset);
          const res = await postLocation({ ...data, farm_id }, asset, { user_id, farm_id });
          expect(res.status).toBe(200);
          expect(res.body.name).toBe(data.name);
          expect(res.body.figure.type).toBe(asset);
          expect(res.body[asset]).toBeDefined();
        });

        test(`should NOT allow worker to create a ${asset}`, async () => {
          const [{ user_id, farm_id }] = await mocks.userFarmFactory(
            {},
            { status: 'Active', role_id: 3 },
          );
          const data = locationData(asset);
          const res = await postLocation({ ...data, farm_id }, asset, { user_id, farm_id });
          expect(res.status).toBe(403);
        });
      });
    });

    test('should create a location', async () => {
      const data = locationData(locations.BARN);

      const res = await postLocation({ ...data, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(200);
    });

    test('should fail to create a barn if I send data for a field as well', async () => {
      const validData = locationData(locations.BARN);
      const data = { ...validData, field: mocks.fakeField() };

      const res = await postLocation({ ...data, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a barn if I send a point instead of area', async () => {
      const validData = locationData(locations.BARN);
      const pointFigure = locationData(locations.GATE);
      const data = { ...validData, figure: pointFigure.figure };

      const res = await postLocation({ ...data, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a barn without area', async () => {
      const validData = locationData(locations.BARN);
      delete validData.figure.area;

      const res = await postLocation({ ...validData, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a field without a name', async () => {
      const validData = locationData(locations.FIELD);
      validData.name = '';

      const res = await postLocation({ ...validData, farm_id: farm }, locations.FIELD, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a field without grid_points', async () => {
      const validData = locationData(locations.FIELD);
      validData.figure.area.grid_points = [{}];

      const res = await postLocation({ ...validData, farm_id: farm }, locations.FIELD, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a field with only 2 grid_points', async () => {
      const validData = locationData(locations.FIELD);
      validData.figure.area.grid_points.pop();

      const res = await postLocation({ ...validData, farm_id: farm }, locations.FIELD, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a location without asset', async () => {
      const validData = locationData(locations.BARN);
      delete validData.barn;

      const res = await postLocation({ ...validData, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    test('should fail to create a location without figure or asset', async () => {
      const validData = locationData(locations.BARN);
      delete validData.barn;
      delete validData.figure;

      const res = await postLocation({ ...validData, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(500);
    });

    test('should fail to add  a user through the location graph', async () => {
      const validData = locationData(locations.BARN);
      const data = {
        ...validData,
        createdByUser: { first_name: 'Hacker', last_name: '1', email: 'maso@alas.com' },
      };

      {
        const res = await postLocation({ ...data, farm_id: farm }, locations.BARN, {
          user_id: user,
          farm_id: farm,
        });

        expect(
          await knex('users').where({ email: data.createdByUser.email }).first(),
        ).toBeUndefined();
      }
    });

    test('should fail to modify  a user through the location graph', async () => {
      const validData = locationData(locations.BARN);
      const data = {
        ...validData,
        updatedByUser: {
          user_id: user,
          first_name: 'Hacker',
          last_name: '1',
          email: 'maso@alas.com',
        },
      };

      const res = await postLocation({ ...data, farm_id: farm }, locations.BARN, {
        user_id: user,
        farm_id: farm,
      });

      expect(res.status).toBe(400);
    });

    Object.keys(figureMapping).map((asset) => {
      test(`should create a ${asset}`, async () => {
        const data = locationData(asset);
        const res = await postLocation({ ...data, farm_id: farm }, asset, {
          user_id: user,
          farm_id: farm,
        });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe(data.name);
        expect(res.body.figure.type).toBe(asset);
        expect(res.body[asset]).toBeDefined();
      });
    });
  });

  xdescribe('PUT /location', () => {
    let user, farm;

    beforeEach(async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory(
        {},
        { status: 'Active', role_id: 1 },
      );
      farm = farm_id;
      user = user_id;
    });

    Object.keys(figureMapping)
      .filter((a) => !['field', 'garden'].includes(a))
      .map((asset) => {
        test(`should modify a ${asset}`, async () => {
          const location = await mocks.locationFactory({ promisedFarm: [{ farm_id: farm }] });
          const typeOfFigure = figureMapping[asset];
          const figure = await mocks[`${typeOfFigure}Factory`]({ promisedLocation: location });
          const promise = promiseMapper[typeOfFigure];
          const [assetToModify] = await mocks[`${asset}Factory`]({
            promisedLocation: location,
            [promise]: figureToPromise[typeOfFigure],
          });
          const [
            {
              location_id,
              created_by_user_id,
              updated_by_user_id,
              created_at,
              updated_at,
              ...locationData
            },
          ] = location;
          const newFigureData = assetMock[asset](false);
          const data = {
            ...locationData,
            name: 'Test Name323',
            figure: {
              location_id,
              figure_id: figure[0].figure_id,
              [typeOfFigure]: {
                ...newFigureData,
                figure_id: figure[0].figure_id,
              },
            },
            [asset]: {
              ...assetToModify,
            },
          };

          const res = await putLocation(
            data,
            { user_id: user, farm_id: farm },
            asset,
            location[0].location_id,
          );
          expect(res.status).toBe(200);
          expect(res.body.name).toBe('Test Name323');
        });
      });

    test('should update a field', async () => {
      const location = await mocks.locationFactory({ promisedFarm: [{ farm_id: farm }] });
      const area = await mocks.areaFactory({ promisedLocation: location });
      const field = await mocks.fieldFactory({ promisedLocation: location, promisedArea: area });
      const [
        {
          location_id,
          created_by_user_id,
          updated_by_user_id,
          created_at,
          updated_at,
          ...locationData
        },
      ] = location;
      const [{ station_id, ...fieldData }] = field;
      const data = {
        ...locationData,
        name: 'Test Name323',
        figure: {
          type: locations.FIELD,
          location_id,
          figure_id: area[0].figure_id,
          area: area[0],
        },
        field: {
          ...fieldData,
          organic_status: 'Non-Organic',
        },
      };

      const res = await putLocation(
        data,
        { user_id: user, farm_id: farm },
        locations.FIELD,
        location[0].location_id,
      );

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Name323');
      expect(res.body.figure.type).toBe(locations.FIELD);
      expect(res.body.field.organic_status).toBe('Non-Organic');
    });

    test('should update a garden', async () => {
      const location = await mocks.locationFactory({ promisedFarm: [{ farm_id: farm }] });
      const area = await mocks.areaFactory({ promisedLocation: location });
      const garden = await mocks.gardenFactory({ promisedLocation: location, promisedArea: area });
      const [
        {
          location_id,
          created_by_user_id,
          updated_by_user_id,
          created_at,
          updated_at,
          ...locationData
        },
      ] = location;
      const [{ station_id, ...gardenData }] = garden;
      const data = {
        ...locationData,
        name: 'Test Name323',
        figure: {
          type: locations.GARDEN,
          location_id,
          figure_id: area[0].figure_id,
          area: area[0],
        },
        garden: {
          ...gardenData,
          organic_status: 'Non-Organic',
        },
      };

      const res = await putLocation(
        data,
        { user_id: user, farm_id: farm },
        locations.GARDEN,
        location[0].location_id,
      );

      console.log(data);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Name323');
      expect(res.body.figure.type).toBe(locations.GARDEN);
      expect(res.body.garden.organic_status).toBe('Non-Organic');
    });
  });
});
