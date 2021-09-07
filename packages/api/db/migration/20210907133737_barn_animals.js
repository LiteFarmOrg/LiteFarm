
exports.up = function(knex) {
  return knex.schema.alterTable('barn', (t) => {
    t.boolean('used_for_animals');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('barn', (t) => {
    t.dropColumn('used_for_animals');
  })
};
