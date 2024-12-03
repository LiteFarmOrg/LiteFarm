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
import server from '../../src/server.js';
import knex from '../../src/util/knex.js';
import mocks from '../mock.factories.js';
import { faker } from '@faker-js/faker';

/**
 * Converts a given Date to the local date in ISO-8601 extended format (YYYY-MM-DD).
 * Date.prototype.toISOString() returns the same format of the UTC (not local) date.
 * @param {Date} date - The date to be converted.
 * @returns {string} The input's local date in YYYY-MM-DD format.
 */
export function toLocal8601Extended(date) {
  return (
    `${date.getFullYear()}-` +
    `${(date.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${date.getDate().toString().padStart(2, '0')}`
  );
}

const today = new Date();
export const todayWithTimezone = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
export const yesterdayInYYYYMMDD = toLocal8601Extended(yesterday);

export const fakeCompletionData = {
  complete_date: '2222-01-01',
  duration: 15,
  happiness: 5,
  completion_notes: faker.lorem.sentence(),
};

export async function postTaskRequest({ user_id, farm_id }, type, data) {
  return chai
    .request(server)
    .post(`/task/${type}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

export async function getTasksRequest({ user_id, farm_id }) {
  return chai
    .request(server)
    .get(`/task/${farm_id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id);
}

export async function patchTaskDateRequest({ user_id, farm_id }, data, task_id) {
  return chai
    .request(server)
    .patch(`/task/patch_due_date/${task_id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

export async function completeTaskRequest({ user_id, farm_id }, data, task_id, type) {
  return chai
    .request(server)
    .patch(`/task/complete/${type}/${task_id}`)
    .set('user_id', user_id)
    .set('farm_id', farm_id)
    .send(data);
}

export function fakeUserFarm(role = 1) {
  return { ...mocks.fakeUserFarm(), role_id: role };
}

export function customFieldWorkTask(task) {
  return { ...mocks.fakeFieldWorkTask(), field_work_task_type: task };
}

export async function userFarmTaskGenerator(linkPlan = true) {
  const userFarm = { ...fakeUserFarm(1), wage: { type: '', amount: 30 } };
  const [{ user_id, farm_id }] = await mocks.userFarmFactory({}, userFarm);
  const [{ task_type_id }] = await mocks.task_typeFactory({ promisedFarm: [{ farm_id }] });
  const [{ location_id }] = await mocks.locationFactory({ promisedFarm: [{ farm_id }] });
  const [{ crop_variety_id }] = await mocks.crop_varietyFactory({ promisedFarm: [{ farm_id }] });

  const [{ management_plan_id }] = linkPlan
    ? await mocks.crop_management_planFactory({
        promisedFarm: [{ farm_id }],
        promisedLocation: [{ location_id }],
        crop_variety: [{ crop_variety_id }],
      })
    : [{ management_plan_id: null }];
  const [{ planting_management_plan_id }] = linkPlan
    ? await knex('planting_management_plan').where({ management_plan_id })
    : [{ planting_management_plan_id: null }];
  return {
    user_id,
    farm_id,
    location_id,
    management_plan_id,
    planting_management_plan_id,
    task_type_id,
  };
}

const generateAnimalMovementTask = async (taskId, animalMovementTask) => {
  if (!animalMovementTask) {
    return;
  }

  // Insert animal_movement_task
  await mocks.animal_movement_taskFactory({ promisedTask: [{ task_id: taskId }] });

  if (!animalMovementTask.purpose_relationships) {
    return { animal_movement_task: { task_id: taskId } };
  }

  // Handle relationships with purposes
  await Promise.all(
    animalMovementTask.purpose_relationships.map(({ purpose_id, other_purpose }) =>
      mocks.animal_movement_task_purpose_relationshipFactory({
        promisedTask: [{ task_id: taskId }],
        promisedPurpose: [{ id: purpose_id }],
        other_purpose,
      }),
    ),
  );

  const purposeRelationships = await knex('animal_movement_task_purpose_relationship').where({
    task_id: taskId,
  });

  return { task_id: taskId, purpose_relationships: purposeRelationships };
};

export const animalTaskGenerator = async (taskData) => {
  const { animals, animal_batches, locations, animal_movement_task, ...otherData } = taskData;

  // Insert the main task record
  const [task] = await mocks.taskFactory({}, otherData);
  const { task_id } = task;

  // Handle relationships with locations
  await Promise.all(
    locations.map(({ location_id }) =>
      mocks.location_tasksFactory({
        promisedTask: [{ task_id }],
        promisedField: [{ location_id }],
      }),
    ),
  );

  // Handle relationships with animals
  if (animals?.length) {
    await knex('task_animal_relationship')
      .insert(animals.map(({ id }) => ({ task_id, animal_id: id })))
      .returning('*');
  }

  // Handle relationships with animal_batches
  if (animal_batches?.length) {
    await knex('task_animal_batch_relationship')
      .insert(animal_batches.map(({ id }) => ({ task_id, animal_batch_id: id })))
      .returning('*');
  }

  // Handle animal_movement_task
  const movementTask = await generateAnimalMovementTask(task_id, animal_movement_task);

  const createdTask = { ...task, locations, animals, animal_batches };
  if (movementTask) {
    createdTask.animal_movement_task = movementTask;
  }

  return createdTask;
};

export const generateUserFarms = async (number) => {
  const userFarms = [];
  const [user] = await mocks.usersFactory();

  for (let i = 0; i < number; i++) {
    const [farm] = await mocks.farmFactory();
    const [{ farm_id }] = await mocks.userFarmFactory(
      { promisedUser: [user], promisedFarm: [farm] },
      { role_id: 1, status: 'Active' },
    );

    userFarms.push({ user_id: user.user_id, farm_id });
  }

  return userFarms;
};

export async function getTask(task_id) {
  return knex('task').where({ task_id }).first();
}
