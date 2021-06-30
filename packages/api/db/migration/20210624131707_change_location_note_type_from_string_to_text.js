
exports.up = async function(knex) {
  await knex.schema.alterTable('location', (t) => {
    t.text('notes').alter();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('location', (t) => {
    t.string('notes').alter();
  });
};
