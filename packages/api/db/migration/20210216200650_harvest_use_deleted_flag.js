
exports.up = function(knex) {
  return knex.schema.alterTable('harvestUse', (t) => {
    t.boolean('deleted').defaultTo(false)
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('harvestUse', (t) => { t.dropColumn('deleted')})
};
