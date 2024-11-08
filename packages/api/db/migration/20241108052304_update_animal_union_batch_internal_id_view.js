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

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  try {
    await knex.schema.dropView('animal_union_batch_id_view');

    // Recreate animal_union_batch_id_view VIEW
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const sqlFilePath = path.join(
      __dirname,
      '../sql/20241108052304_animal_union_batch_id_view.sql',
    );
    const sqlQuery = fs.readFileSync(sqlFilePath).toString();
    await knex.raw(sqlQuery);
  } catch (error) {
    console.error('Error in migration up:', error);
    throw error; // Rethrow the error to ensure the migration fails
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropView('animal_union_batch_id_view');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const sqlFilePath = path.join(__dirname, '../sql/20240207214919_animal_union_batch_id_view.sql');
  const sqlQuery = fs.readFileSync(sqlFilePath).toString();
  await knex.raw(sqlQuery);
};
