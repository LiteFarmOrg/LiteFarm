export const up = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.text('notes').alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.string('notes').alter();
  });
};
