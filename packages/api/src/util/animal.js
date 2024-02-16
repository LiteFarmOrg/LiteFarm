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
 * @param {Array<Object>} records - The array of records to which internal identifiers will be assigned.
 * @param {string} kind - The kind of records being processed ('batch' or other).
 * @param {Array<number>} recordIds - The array of record IDs to use for retrieving internal identifiers.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of records with assigned internal identifiers.
 */
export const assignInternalIdentifiers = async (records, kind, recordIds) => {
  const internalIdentifiers = await knex('animal_union_batch')
    .pluck('internal_identifier')
    .whereIn('id', recordIds)
    .andWhere({ batch: kind === 'batch' });

  const newRecords = [];
  records.forEach((record, index) => {
    newRecords.push({ ...record, internal_identifier: internalIdentifiers[index] });
  });

  return newRecords;
};
