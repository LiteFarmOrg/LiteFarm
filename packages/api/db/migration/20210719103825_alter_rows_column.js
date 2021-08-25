exports.up = async function (knex) {
  await knex.schema.alterTable('rows', t => {
    t.decimal('total_rows_length', 36, 12).alter();
    t.decimal('estimated_seeds', 36, 12).alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('rows', t => {
    t.integer('total_rows_length', 36, 12).alter();
    t.integer('estimated_seeds', 36, 12).alter();
  });
};