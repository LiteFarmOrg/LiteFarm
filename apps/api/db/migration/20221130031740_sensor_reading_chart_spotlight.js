export const up = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.boolean('sensor_reading_chart').defaultTo(false);
    t.timestamp('sensor_reading_chart_end').nullable().defaultTo(null);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('showedSpotlight', (t) => {
    t.dropColumn('sensor_reading_chart');
    t.dropColumn('sensor_reading_chart_end');
  });
};
