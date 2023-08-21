export const up = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.string('abandonment_reason');
    t.string('other_abandonment_reason');
    t.text('abandonment_notes');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.dropColumn('abandonment_reason');
    t.dropColumn('other_abandonment_reason');
    t.dropColumn('abandonment_notes');
  });
};
