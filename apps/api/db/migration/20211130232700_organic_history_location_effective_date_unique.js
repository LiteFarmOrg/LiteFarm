export const up = function (knex) {
  return knex.schema.alterTable('organic_history', function (table) {
    table.unique(['location_id', 'effective_date']);
  });
};

export const down = function (knex) {
  return knex.raw(
    `
    ALTER TABLE "organic_history"
    DROP CONSTRAINT "organic_history_location_id_effective_date_unique"
    `,
  );
};
