exports.up = async function(knex) {
  await knex.schema.alterTable('task', (t) => {
    t.text('notes').alter();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('task', (t) => {
    t.string('notes').alter();
  });
};
