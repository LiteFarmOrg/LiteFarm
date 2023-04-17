export const up = async function (knex) {
  await knex.schema.alterTable('location', (t) => {
    t.text('notes').alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('location', (t) => {
    t.string('notes').alter();
  });
};
