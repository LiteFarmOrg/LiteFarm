export const up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('certifiers', (table) => {
      table.renameColumn('certification_type', 'certification_id');
    }),
    knex.raw(
      'ALTER TABLE certifiers RENAME CONSTRAINT certifiers_certification_type_foreign TO "certifiers_certification_id_foreign"',
    ),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('certifiers', (table) => {
      table.renameColumn('certification_id', 'certification_type');
    }),
    knex.raw(
      'ALTER TABLE certifiers RENAME CONSTRAINT certifiers_certification_id_foreign TO "certifiers_certification_type_foreign"',
    ),
  ]);
};
