/*
 *  Copyright 2024 LiteFarm.org
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
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
import server from '../src/server.js';
import knex from '../src/util/knex.js';

jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt.js', () =>
  jest.fn((req, res, next) => {
    req.auth = {};
    req.auth.user_id = req.get('user_id');
    next();
  }),
);
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import animalUnionBatchIdViewModel from '../src/models/animalUnionBatchIdViewModel.js';
import { makeAnimalOrBatchForFarm } from './utils/animalUtils.js';

const getAnimals = async (user_id, farm_id) => {
  return chai.request(server).get('/animals').set('user_id', user_id).set('farm_id', farm_id);
};

const getBatches = async (user_id, farm_id) => {
  return chai
    .request(server)
    .get('/animal_batches')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
};

const patchAnimals = async (user_id, farm_id, data) => {
  return chai
    .request(server)
    .patch('/animals')
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
};

const patchBatches = async (user_id, farm_id, data) => {
  return chai
    .request(server)
    .patch('/animal_batches')
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
};

describe('Animal Union Batch Tests', () => {
  afterEach(async (done) => {
    await tableCleanup(knex);
    done();
  });

  afterAll(async (done) => {
    await knex.destroy();
    done();
  });

  // MODEL TESTS
  describe('Animal Union Batch Model Tests', () => {
    test('Internal identifiers should not change over time', async () => {
      const [firstFarm] = await mocks.farmFactory();
      const [secondFarm] = await mocks.farmFactory();

      // add animalBatchId later
      const animalsAndBatches = [
        { farm: firstFarm, kind: 'animal', expectedInternalIdentifier: 1 },
        { farm: firstFarm, kind: 'animal', expectedInternalIdentifier: 2 },
        { farm: firstFarm, kind: 'animal', expectedInternalIdentifier: 3 },
        { farm: secondFarm, kind: 'batch', expectedInternalIdentifier: 1 },
        { farm: firstFarm, kind: 'animal', expectedInternalIdentifier: 4 },
        { farm: firstFarm, kind: 'batch', expectedInternalIdentifier: 5 },
        { farm: firstFarm, kind: 'batch', expectedInternalIdentifier: 6 },
        { farm: secondFarm, kind: 'batch', expectedInternalIdentifier: 2 },
        { farm: firstFarm, kind: 'animal', expectedInternalIdentifier: 7 },
        { farm: secondFarm, kind: 'animal', expectedInternalIdentifier: 3 },
      ];

      for (const [index, { farm, kind }] of animalsAndBatches.entries()) {
        const data = await makeAnimalOrBatchForFarm({ kind, farm });
        animalsAndBatches[index].animalBatchId = data.id;

        // check all internal_identifiers in VIEW every time a row is inserted to animal or batch table
        const animalsAndBatchesInVIEW = await animalUnionBatchIdViewModel
          .query()
          .select('id', 'batch', 'internal_identifier');

        animalsAndBatchesInVIEW.forEach(({ id, batch, internal_identifier }) => {
          const { expectedInternalIdentifier } = animalsAndBatches.find(
            ({ animalBatchId, kind }) => {
              const isBatch = kind === 'batch';
              return id === animalBatchId && isBatch === batch;
            },
          );

          expect(internal_identifier).toBe(expectedInternalIdentifier);
        });
      }
    });

    test('Internal identifiers should not change after data is updated', async () => {
      const [{ user_id, farm_id }] = await mocks.userFarmFactory({ roleId: 1 });

      const animals = await Promise.all(
        Array(4)
          .fill()
          .map(() => mocks.animalFactory({ promisedFarm: [{ farm_id }] })),
      );
      const batches = await Promise.all(
        Array(4)
          .fill()
          .map(() => mocks.animal_batchFactory({ promisedFarm: [{ farm_id }] })),
      );

      // Set created_at to a fixed value to ensure the order is determined by other columns (batch, id)
      await knex('animal').update({ created_at: '2024-11-08 00:00:00.000-00' });
      await knex('animal_batch').update({ created_at: '2024-11-08 00:00:00.000-00' });

      const animalsBeforeRes = await getAnimals(user_id, farm_id);
      const batchesBeforeRes = await getBatches(user_id, farm_id);

      for (let i = 0; i < 10; i++) {
        await patchAnimals(
          user_id,
          farm_id,
          animals.map(([animal]) => ({ id: animal.id, notes: '' })),
        );
        await patchBatches(
          user_id,
          farm_id,
          batches.map(([batch]) => ({ id: batch.id, notes: '' })),
        );

        const animalsAfterRes = await getAnimals(user_id, farm_id);
        animalsBeforeRes.body.forEach((before) => {
          const after = animalsAfterRes.body.find(({ id }) => before.id === id);
          expect(before.internal_identifier).toBe(after.internal_identifier);
        });

        const batchesAfterRes = await getBatches(user_id, farm_id);
        batchesBeforeRes.body.forEach((before) => {
          const after = batchesAfterRes.body.find(({ id }) => before.id === id);
          expect(before.internal_identifier).toBe(after.internal_identifier);
        });
      }
    });
  });
});
