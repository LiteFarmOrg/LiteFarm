
exports.up = async function(knex) {
  await knex.schema.alterTable('task', (t) => {
    t.boolean('override_hourly_wage').defaultTo(false);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('task', (t) => {
    t.dropColumn('override_hourly_wage');
  });
};
