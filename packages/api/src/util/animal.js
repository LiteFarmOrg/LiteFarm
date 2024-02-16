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

import knex from './knex.js';

/**
 * Assigns internal identifiers to records based on the provided record IDs and kind.
 * @param {Array<Object>} records - The array of records to which internal identifiers will be assigned. Each record is expected to contain an 'id' property.
 * @param {string} kind - The kind of records being processed ('batch' or other).
 */
export const assignInternalIdentifiers = async (records, kind) => {
  await Promise.all(
    records.map(async (record) => {
      const [internalIdentifier] = await knex('animal_union_batch')
        .pluck('internal_identifier')
        .where('id', record.id)
        .andWhere({ batch: kind === 'batch' });

      record.internal_identifier = internalIdentifier;
    }),
  );
};
