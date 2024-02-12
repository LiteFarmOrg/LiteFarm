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

import mocks from '../mock.factories.js';

export const makeFarmsWithAnimalsAndBatches = async (user) => {
  const [firstFarm] = await mocks.userFarmFactory({ promisedUser: [user], roleId: 1 });
  const [secondFarm] = await mocks.userFarmFactory({ promisedUser: [user], roleId: 1 });
  const [thirdFarm] = await mocks.userFarmFactory({ promisedUser: [user], roleId: 1 });
  const [fourthFarm] = await mocks.userFarmFactory({ promisedUser: [user], roleId: 1 });

  const existingAnimalsAndBatchesCountsPerFarm = [
    { farm: firstFarm, animalCount: 3, batchCount: 2 },
    { farm: secondFarm, animalCount: 0, batchCount: 4 },
    { farm: thirdFarm, animalCount: 10, batchCount: 0 },
    { farm: fourthFarm, animalCount: 0, batchCount: 0 },
  ];

  // add animals and batches to the DB
  for (const { farm, animalCount, batchCount } of existingAnimalsAndBatchesCountsPerFarm) {
    for (let i = 0; i < animalCount; i++) {
      await mocks.animalFactory({ promisedFarm: [farm] });
    }
    for (let i = 0; i < batchCount; i++) {
      await mocks.animal_batchFactory({ promisedFarm: [farm] });
    }
  }

  return { existingAnimalsAndBatchesCountsPerFarm };
};

export const makeAnimalOrBatchForFarm = async ({ isAnimal, farm }) => {
  const [data] = isAnimal
    ? await mocks.animalFactory({ promisedFarm: [farm] })
    : await mocks.animal_batchFactory({ promisedFarm: [farm] });

  return data;
};
