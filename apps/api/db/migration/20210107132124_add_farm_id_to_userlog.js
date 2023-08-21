export const up = function (knex) {
  return knex.schema.alterTable('userLog', (t) => {
    t.uuid('farm_id').references('farm_id').inTable('farm');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('userLog', (t) => {
    t.dropColumn('farm_id');
  });
};
