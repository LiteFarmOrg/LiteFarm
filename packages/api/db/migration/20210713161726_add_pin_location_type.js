
exports.up = async function(knex) {
  await knex.schema.createTable('pin', t => {
    t.uuid('location_id').references('location_id').inTable('location');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('pin')
};
