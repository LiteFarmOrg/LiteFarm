/*
 *  Copyright (c) 2024 LiteFarm.org
 *  This file is part of LiteFarm.
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

import chai from 'chai';
import util from 'util';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, _res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import mocks from './mock.factories.js';
import customAnimalBreedModel from '../src/models/customAnimalBreedModel.js';

describe('Custom Animal Breed Tests', () => {
  let farm;
  let newOwner;
  let defaultTypeId;

  beforeAll(async () => {
    const [defaultAnimalType] = await mocks.default_animal_typeFactory();
    defaultTypeId = defaultAnimalType.id;
  });

  function getRequest(
    { user_id = newOwner.user_id, farm_id = farm.farm_id, query_params_string },
    callback,
  ) {
    chai
      .request(server)
      .get(`/custom_animal_breeds?${query_params_string}`)
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest(data, { user_id, farm_id }, callback) {
    chai
      .request(server)
      .post(`/custom_animal_breeds`)
      .set('Content-Type', 'application/json')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .send(data)
      .end(callback);
  }

  const postRequestAsPromise = util.promisify(postRequest);

  function fakeUserFarm(role = 1) {
    return { ...mocks.fakeUserFarm(), role_id: role };
  }

  async function returnUserFarms(role) {
    const [mainFarm] = await mocks.farmFactory();
    const [user] = await mocks.usersFactory();

    await mocks.userFarmFactory(
      {
        promisedUser: [user],
        promisedFarm: [mainFarm],
      },
      fakeUserFarm(role),
    );
    return { mainFarm, user };
  }

  async function makeCustomAnimalBreed(mainFarm, properties) {
    const [animal_breed] = await mocks.custom_animal_breedFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animal_breed;
  }

  async function makeDefaultAnimalType() {
    const [animal_type] = await mocks.default_animal_typeFactory();
    return animal_type;
  }

  async function makeUserCreatedAnimalType(mainFarm) {
    const [custom_animal_type] = await mocks.custom_animal_typeFactory({
      promisedFarm: [mainFarm],
    });
    return custom_animal_type;
  }

  beforeEach(async () => {
    [farm] = await mocks.farmFactory();
    [newOwner] = await mocks.usersFactory();
  });

  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  // GET TESTS
  describe('Get custom animal breed tests', () => {
    test('All users should get custom animal breeds for a default type', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds, one with the default type and one with a custom one
        const firstBreed = await makeCustomAnimalBreed(mainFarm, {
          default_type_id: defaultTypeId,
          custom_type_id: null,
        });
        await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query_params_string: `default_type_id=${defaultTypeId}`,
        });

        expect(res.status).toBe(200);
        // Should return breed with default type only
        expect(res.body.length).toBe(1);
        expect(res.body[0].farm_id).toBe(mainFarm.farm_id);
        expect(firstBreed).toMatchObject(res.body[0]);
      }
    });

    test('All users should get custom animal breeds for a custom type', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds, one with the default type and one with a custom one
        await makeCustomAnimalBreed(mainFarm, {
          default_type_id: defaultTypeId,
          custom_type_id: null,
        });
        const secondBreed = await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
          query_params_string: `custom_type_id=${secondBreed.custom_type_id}`,
        });

        expect(res.status).toBe(200);
        // Should return breed with custom type only
        expect(res.body.length).toBe(1);
        expect(res.body[0].farm_id).toBe(mainFarm.farm_id);
        expect(secondBreed).toMatchObject(res.body[0]);
      }
    });

    test('All users should get custom animal breeds for all types', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        // Create two breeds with different types
        await makeCustomAnimalBreed(mainFarm);
        await makeCustomAnimalBreed(mainFarm);

        const res = await getRequestAsPromise({ user_id: user.user_id, farm_id: mainFarm.farm_id });

        expect(res.status).toBe(200);
        // Should return both breeds
        expect(res.body.length).toBe(2);
        res.body.forEach((breed) => {
          expect(breed.farm_id).toBe(mainFarm.farm_id);
        });
      }
    });

    test('Unauthorized user should get 403 if they try to get custom animal breeds', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeCustomAnimalBreed(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): get:animal_breeds',
      );
    });

    test('Returns 400 if both default and custom type ID are specified', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const res = await getRequestAsPromise({
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
        query_params_string: 'default_type_id=1&custom_type_id=1',
      });

      expect(res.status).toBe(400);
    });
  });

  // POST tests
  describe('POST custom animal breed tests', () => {
    test('Admin users should be able to post new custom animal breed', async () => {
      const adminRoles = [1, 2, 5];

      for (const role of adminRoles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animal_type = await makeDefaultAnimalType();
        const animal_breed = mocks.fakeCustomAnimalBreed({ default_type_id: animal_type.id });
        const res = await postRequestAsPromise(animal_breed, {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        // Check response
        expect(res).toMatchObject({
          status: 201,
          body: {
            farm_id: mainFarm.farm_id,
            default_type_id: animal_breed.default_type_id,
            breed: animal_breed.breed,
          },
        });

        // Check database
        const animal_breeds = await customAnimalBreedModel
          .query()
          .where('farm_id', mainFarm.farm_id)
          .andWhere('default_type_id', animal_breed.default_type_id)
          .andWhere('breed', animal_breed.breed);

        expect(animal_breeds).toHaveLength(1);
      }
    });

    test('Worker should not be able to post new custom animal breed', async () => {
      const { mainFarm, user } = await returnUserFarms(3);

      const animal_type = await makeDefaultAnimalType();
      const animal_breed = mocks.fakeCustomAnimalBreed({ default_type_id: animal_type.id });
      const res = await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(403);
      expect(res.error.text).toBe(
        'User does not have the following permission(s): add:animal_breeds',
      );

      const animal_breeds = await customAnimalBreedModel
        .query()
        .where('farm_id', mainFarm.farm_id)
        .andWhere('default_type_id', animal_breed.default_type_id)
        .andWhere('breed', animal_breed.breed);

      // Check database
      expect(animal_breeds).toHaveLength(0);
    });

    test('Creating the same breed as an existing breed on farm should return a conflict error', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = await makeDefaultAnimalType();
      const animal_breed = mocks.fakeCustomAnimalBreed({ default_type_id: animal_type.id });

      await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      const res = await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res.status).toBe(409);

      // Check database (no second record created)
      const animal_breeds = await customAnimalBreedModel
        .query()
        .where('farm_id', mainFarm.farm_id)
        .andWhere('default_type_id', animal_breed.default_type_id)
        .andWhere('breed', animal_breed.breed);

      expect(animal_breeds).toHaveLength(1);
    });

    test('Creating the same breed as a deleted breed should be allowed', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      const animal_type = await makeDefaultAnimalType();
      const animal_breed = mocks.fakeCustomAnimalBreed({ default_type_id: animal_type.id });

      await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      await customAnimalBreedModel
        .query()
        .context({ user_id: user.user_id })
        .where('farm_id', mainFarm.farm_id)
        .andWhere('default_type_id', animal_breed.default_type_id)
        .andWhere('breed', animal_breed.breed)
        .delete();

      const res = await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      // Check response
      expect(res).toMatchObject({
        status: 201,
        body: {
          farm_id: mainFarm.farm_id,
          default_type_id: animal_breed.default_type_id,
          breed: animal_breed.breed,
        },
      });

      // Check database
      const animal_breeds = await customAnimalBreedModel
        .query()
        .where('farm_id', mainFarm.farm_id)
        .andWhere('default_type_id', animal_breed.default_type_id)
        .andWhere('breed', animal_breed.breed);

      expect(animal_breeds).toHaveLength(2);
    });

    test('Creating a custom breed using a custom type should be allowed', async () => {
      const { mainFarm, user } = await returnUserFarms(1);

      // Make a custom type
      const animal_type = await makeUserCreatedAnimalType(mainFarm);
      const animal_breed = mocks.fakeCustomAnimalBreed({ custom_type_id: animal_type.id });

      // Try to make a custom breed in using custom type
      const res = await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res).toMatchObject({
        status: 201,
        body: {
          farm_id: mainFarm.farm_id,
          custom_type_id: animal_breed.custom_type_id,
          breed: animal_breed.breed,
        },
      });
    });

    test('Creating a custom breed using another farms custom type should be forbidden', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const { mainFarm: secondFarm, user: secondUser } = await returnUserFarms(1);

      // Make a custom type on Farm 2
      const second_farm_animal_type = await makeUserCreatedAnimalType(secondFarm);
      const animal_breed = mocks.fakeCustomAnimalBreed({
        custom_type_id: second_farm_animal_type.id,
      });

      // Try to make a custom breed in Farm 1 using Farm 2's custom type
      const res = await postRequestAsPromise(animal_breed, {
        user_id: user.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(400);
    });
  });
});
