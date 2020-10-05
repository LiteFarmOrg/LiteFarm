exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('farm', (t) => {
      t.jsonb('units').defaultTo(JSON.stringify({
        measurement: 'metric',
        currency: 'USD',
        date_format: 'MM/DD/YY',
      })).alter()
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('farm', (t) => {
      t.jsonb('units').defaultTo(JSON.stringify({
        measurement: 'metric',
        currency: 'CAD',
        date_format: 'MM/DD/YY',
      })).alter()
    }),
  ])
};
