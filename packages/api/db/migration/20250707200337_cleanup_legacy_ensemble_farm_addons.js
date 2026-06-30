/*
 *  Copyright 2025 LiteFarm.org
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  // Rows to be inserted to 'migration_deletion_logs' table
  // When rolling back, rows will be restored backwards
  const rowsToLog = [];
  const addToLogs = (rows, tableName) => {
    rows.forEach((row) => {
      rowsToLog.push({ table_name: tableName, data: row });
    });
  };

  const legacyEnsembleFarmAddons = await knex('farm_addon')
    .where('addon_partner_id', 1)
    .whereNull('org_pk');

  addToLogs(legacyEnsembleFarmAddons, 'farm_addon');

  // Delete logged records
  await knex('farm_addon').where('addon_partner_id', 1).whereNull('org_pk').del();

  if (rowsToLog.length) {
    await knex('migration_deletion_logs').insert(
      rowsToLog.map((row) => ({
        migration_name: 'cleanup_legacy_ensemble_farm_addons',
        ...row,
      })),
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  // Restore deleted rows from migration_deletion_logs
  const rows = await knex('migration_deletion_logs')
    .where('migration_name', 'cleanup_legacy_ensemble_farm_addons')
    .orderBy('id', 'desc');

  for (const { table_name, data } of rows) {
    try {
      await knex(table_name).insert(data);
    } catch (err) {
      console.error(`Failed to restore row in ${table_name}:`, err);
      throw err;
    }
  }

  await knex('migration_deletion_logs')
    .where('migration_name', 'cleanup_legacy_ensemble_farm_addons')
    .del();
};
