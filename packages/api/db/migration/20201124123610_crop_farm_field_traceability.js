const tables = [
  'crop',
  'farm',
  'field',
  'fieldCrop',
  'disease',
  'farmExpense',
  'farmExpenseType',
  'fertilizer',
  'pesticide',
  'shift',
  'taskType',
];

export const up = function (knex) {
  const promiseArray = tables.map((table) =>
    knex.schema.alterTable(table, (t) => {
      t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
      t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    }),
  );
  return Promise.all(promiseArray);
};

export const down = function (knex) {
  const promiseArray = tables.map((table) =>
    knex.schema.alterTable(table, (t) => {
      t.dropForeign('created_by_user_id');
      t.dropColumn('created_by_user_id');
      t.dropForeign('updated_by_user_id');
      t.dropColumn('updated_by_user_id');
      t.dropColumn('created_at');
      t.dropColumn('updated_at');
    }),
  );
  return Promise.all(promiseArray);
};
