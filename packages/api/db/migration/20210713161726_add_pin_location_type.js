exports.up = async function (knex) {
  await knex.schema.createTable('pin', t => {
    t.uuid('location_id').primary().references('location_id')
      .inTable('location').unique().onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('pin');
};
