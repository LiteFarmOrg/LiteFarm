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
import mocks from '../mock.factories.js';

import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../../src/server.js';

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

/**
 * Returns animal or animal batch depending on the given kind.
 * @param {string} kind 'animal' or 'batch'
 * @param {object} farm
 * @return {object} animal or batch
 */
export const makeAnimalOrBatchForFarm = async ({ kind, farm }) => {
  const [data] =
    kind === 'animal'
      ? await mocks.animalFactory({ promisedFarm: [farm] })
      : await mocks.animal_batchFactory({ promisedFarm: [farm] });

  return data;
};

const entityEndpoints = {
  animal: 'animals',
  batch: 'animal_batches',
};

const getGetRequest = (entity) => async ({ user_id, farm_id }) => {
  return await chai
    .request(server)
    .get(`/${entity}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id);
};

const getPostRequest = (entity) => async ({ user_id, farm_id }, data) => {
  return await chai
    .request(server)
    .post(`/${entity}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
};

const getRemoveRequest = (entity) => async ({ user_id, farm_id }, data) => {
  return await chai
    .request(server)
    .patch(`/${entity}/remove`)
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
};

const getPatchRequest = (entity) => async ({ user_id, farm_id }, data) => {
  return await chai
    .request(server)
    .patch(`/${entity}`)
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
};

const getDeleteRequest = (entity) => async ({ user_id, farm_id, query = '' }) => {
  return await chai
    .request(server)
    .delete(`/${entity}?${query}`)
    .set('Content-Type', 'application/json')
    .set('user_id', user_id)
    .set('farm_id', farm_id);
};

export const {
  animalGetRequest = getGetRequest(entityEndpoints['animal']),
  animalPostRequest = getPostRequest(entityEndpoints['animal']),
  animalRemoveRequest = getRemoveRequest(entityEndpoints['animal']),
  animalPatchRequest = getPatchRequest(entityEndpoints['animal']),
  animalDeleteRequest = getDeleteRequest(entityEndpoints['animal']),
  batchGetRequest = getGetRequest(entityEndpoints['batch']),
  batchPostRequest = getPostRequest(entityEndpoints['batch']),
  batchRemoveRequest = getRemoveRequest(entityEndpoints['batch']),
  batchPatchRequest = getPatchRequest(entityEndpoints['batch']),
  batchDeleteRequest = getDeleteRequest(entityEndpoints['batch']),
} = {};
