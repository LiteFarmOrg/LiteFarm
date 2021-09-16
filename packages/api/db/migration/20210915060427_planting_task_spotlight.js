exports.up = function(knex) {
  return knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('planting_task').defaultTo(false);
    t.timestamp('planting_task_end').nullable().defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('planting_task');
    t.dropColumn('planting_task_end');
  });
};
