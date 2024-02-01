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

describe('Animal Tests', () => {
  let farm;
  let newOwner;
  let defaultBreed;

  beforeAll(async () => {
    [defaultBreed] = await mocks.default_animal_breedFactory();
  });

  function getRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, callback) {
    chai
      .request(server)
      .get('/animals')
      .set('user_id', user_id)
      .set('farm_id', farm_id)
      .end(callback);
  }

  const getRequestAsPromise = util.promisify(getRequest);

  function postRequest({ user_id = newOwner.user_id, farm_id = farm.farm_id }, data, callback) {
    chai
      .request(server)
      .post('/animals')
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

  async function makeAnimal(mainFarm, properties) {
    const [animal] = await mocks.animalFactory({
      promisedFarm: [mainFarm],
      properties,
    });
    return animal;
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
  describe('Get animals tests', () => {
    test('All users should get animals for their farm', async () => {
      const roles = [1, 2, 3, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [secondFarm] = await mocks.farmFactory();
        const [customAnimalBreed] = await mocks.custom_animal_breedFactory();

        // Create two animals, one with a default breed and one with a custom breed
        const firstAnimal = await makeAnimal(mainFarm, {
          default_type_id: defaultBreed.default_type_id,
          default_breed_id: defaultBreed.id,
        });
        const secondAnimal = await makeAnimal(mainFarm, {
          default_type_id: null,
          default_breed_id: null,
          custom_type_id: customAnimalBreed.custom_type_id,
          custom_breed_id: customAnimalBreed.id,
        });
        // Create a third animal belonging to a different farm
        await makeAnimal(secondFarm);

        const res = await getRequestAsPromise({
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        });

        expect(res.status).toBe(200);
        // Should return first two animals
        expect(res.body.length).toBe(2);
        res.body.forEach((animal) => {
          expect(animal.farm_id).toBe(mainFarm.farm_id);
        });
        expect(firstAnimal).toMatchObject(res.body[0]);
        expect(secondAnimal).toMatchObject(res.body[1]);
      }
    });

    test('Unauthorized user should get 403 if they try to get animals', async () => {
      const { mainFarm } = await returnUserFarms(1);
      await makeAnimal(mainFarm);
      const [unAuthorizedUser] = await mocks.usersFactory();

      const res = await getRequestAsPromise({
        user_id: unAuthorizedUser.user_id,
        farm_id: mainFarm.farm_id,
      });

      expect(res.status).toBe(403);
      expect(res.error.text).toBe('User does not have the following permission(s): get:animals');
    });
  });

  describe('Add animal tests', () => {
    test('Admin users should be able to create animals', async () => {
      const roles = [1, 2, 5];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const [animalType] = await mocks.custom_animal_typeFactory({
          promisedFarm: [mainFarm],
        });
        const [animalBreed] = await mocks.custom_animal_breedFactory({
          promisedFarm: [mainFarm],
        });

        const firstAnimal = mocks.fakeAnimal({
          default_type_id: defaultBreed.default_type_id,
          default_breed_id: defaultBreed.id,
        });
        const secondAnimal = mocks.fakeAnimal({
          custom_type_id: animalBreed.custom_type_id,
          custom_breed_id: animalBreed.id,
        });

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [firstAnimal, secondAnimal],
        );

        console.log(res.error);
        expect(res.status).toBe(201);
        expect(res.body[0]).toMatchObject(firstAnimal);
        expect(res.body[1]).toMatchObject(secondAnimal);

        res.body.forEach((animal) => expect(animal.farm_id).toBe(mainFarm.farm_id));
      }
    });

    test('Non-admin users should not be able to create animals', async () => {
      const roles = [3];

      for (const role of roles) {
        const { mainFarm, user } = await returnUserFarms(role);
        const animal = mocks.fakeAnimal();

        const res = await postRequestAsPromise(
          {
            user_id: user.user_id,
            farm_id: mainFarm.farm_id,
          },
          [animal],
        );

        expect(res.status).toBe(403);
        expect(res.error.text).toBe('User does not have the following permission(s): add:animals');
      }
    });

    test('Should not be able to send out an individual animal instead of an array', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal();

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        animal,
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal without name or identifier', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal({
        name: null,
        identifier: null,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal without a type', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal({
        default_type_id: null,
        custom_type_id: null,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal without a breed', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const animal = mocks.fakeAnimal({
        default_breed_id: null,
        custom_breed_id: null,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal with a breed belonging to a different farm', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [secondFarm] = await mocks.farmFactory();
      const [animalBreed] = await mocks.custom_animal_breedFactory({
        promisedFarm: [secondFarm],
      });

      const animal = mocks.fakeAnimal({
        default_type_id: null,
        custom_type_id: animalBreed.custom_type_id,
        default_breed_id: null,
        custom_breed_id: animalBreed.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });

    test('Should not be able to create an animal where type and breed do not match', async () => {
      const { mainFarm, user } = await returnUserFarms(1);
      const [animalBreed] = await mocks.default_animal_breedFactory();

      const animal = mocks.fakeAnimal({
        default_breed_id: animalBreed.id,
      });

      const res = await postRequestAsPromise(
        {
          user_id: user.user_id,
          farm_id: mainFarm.farm_id,
        },
        [animal],
      );

      expect(res.status).toBe(400);
    });
  });
});
