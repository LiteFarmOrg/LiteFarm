exports.up = async function(knex) {
  await knex.schema.alterTable('file', (t) => {
    t.string('thumbnail_url').alter();
  });
};

exports.down = async function(knex) {
};
