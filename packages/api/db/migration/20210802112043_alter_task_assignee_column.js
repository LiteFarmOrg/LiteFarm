exports.up = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.string('assignee_user_id').references('user_id').inTable('users').nullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.string('assignee_user_id').references('user_id').inTable('users').alter();
  });
};
