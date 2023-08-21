export const up = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.renameColumn('completed_time', 'complete_date');
    t.renameColumn('abandoned_time', 'abandon_date');
  });

  await knex.schema.alterTable('task', (t) => {
    t.date('complete_date').alter();
    t.date('abandon_date').alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('task', (t) => {
    t.dateTime('complete_date').alter();
    t.dateTime('abandon_date').alter();
    t.renameColumn('complete_date', 'completed_time');
    t.renameColumn('abandon_date', 'abandoned_time');
  });
};
