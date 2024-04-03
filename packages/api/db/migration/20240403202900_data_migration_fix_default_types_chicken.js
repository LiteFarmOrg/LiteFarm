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
  const { id: keepRowId } = await knex('default_animal_type')
    .where('key', 'CHICKEN_BROILERS')
    .first();
  const { id: deleteRowId } = await knex('default_animal_type')
    .where('key', 'CHICKEN_LAYERS')
    .first();

  // custom animal breeds
  await knex('custom_animal_breed')
    .where('default_type_id', deleteRowId)
    .update({ default_type_id: keepRowId });
  // default animal breeds
  await knex('default_animal_breed')
    .where('default_type_id', deleteRowId)
    .update({ default_type_id: keepRowId });
  // animal
  await knex('animal').where('default_type_id', deleteRowId).update({ default_type_id: keepRowId });
  // animal batch
  await knex('animal_batch')
    .where('default_type_id', deleteRowId)
    .update({ default_type_id: keepRowId });

  // animal identifier placement
  await knex('animal_identifier_placement').where('default_type_id', deleteRowId).del();

  // now complete deletion and renaming excess default type
  await knex('default_animal_type').where('id', keepRowId).update({ key: 'CHICKEN' });
  await knex('default_animal_type').where('id', deleteRowId).del();
};

export const down = async function (knex) {
  // Migrated data is not recoverable but schema can be replaced
  await knex('default_animal_type').where('key', 'CHICKEN').update({ key: 'CHICKEN_BROILERS' });
  const [deletedType] = await knex('default_animal_type')
    .insert({ key: 'CHICKEN_LAYERS' })
    .returning('id');

  await knex('animal_identifier_placement').insert({
    default_type_id: deletedType.id,
    key: 'LEFT_LEG',
  });
  await knex('animal_identifier_placement').insert({
    default_type_id: deletedType.id,
    key: 'RIGHT_LEG',
  });
};
