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

import server from '../src/server.js';
import knex from '../src/util/knex.js';
import { tableCleanup } from './testEnvironment.js';
import mocks from './mock.factories.js';
import animalUnionBatchIdViewModel from '../src/models/animalUnionBatchIdViewModel.js';
import { makeAnimalOrBatchForFarm } from './utils/animalUtils.js';

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
  });
});
