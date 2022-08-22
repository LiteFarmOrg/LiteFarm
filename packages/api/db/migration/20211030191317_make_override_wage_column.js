export const up = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.boolean('override_hourly_wage').defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.dropColumn('override_hourly_wage');
  });
};
