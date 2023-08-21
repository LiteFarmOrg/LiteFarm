export const up = function (knex) {
  return knex.schema.alterTable('task', (t) => {
    t.renameColumn('type', 'task_type_id');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('task', (t) => {
    t.renameColumn('task_type_id', 'type');
  });
};
