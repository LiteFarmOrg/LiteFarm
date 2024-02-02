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

export const up = async function (knex) {
  await knex('permissions')
    .where({ permission_id: 159 })
    .update({ name: 'add:animal_batches', description: 'add animal_batches' });
  await knex('permissions')
    .where({ permission_id: 160 })
    .update({ name: 'delete:animal_batches', description: 'delete animal_batches' });
  await knex('permissions')
    .where({ permission_id: 161 })
    .update({ name: 'edit:animal_batches', description: 'edit animal_batches' });
  await knex('permissions')
    .where({ permission_id: 162 })
    .update({ name: 'get:animal_batches', description: 'get animal_batches' });
};

export const down = async function (knex) {
  await knex('permissions')
    .where({ permission_id: 159 })
    .update({ name: 'add:animal_batch', description: 'add animal_batch' });
  await knex('permissions')
    .where({ permission_id: 160 })
    .update({ name: 'delete:animal_batch', description: 'delete animal_batch' });
  await knex('permissions')
    .where({ permission_id: 161 })
    .update({ name: 'edit:animal_batch', description: 'edit animal_batch' });
  await knex('permissions')
    .where({ permission_id: 162 })
    .update({ name: 'get:animal_batch', description: 'get animal_batch' });
};
