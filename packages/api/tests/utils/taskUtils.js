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

export const fakeCompletionData = {
  complete_date: '2222-01-01',
  duration: 15,
  happiness: 5,
  completion_notes: faker.lorem.sentence(),
};

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
