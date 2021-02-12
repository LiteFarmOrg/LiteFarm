
exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('sale', (table) => {
      table.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
      table.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
      table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
      table.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    }),
  ]);
}
exports.down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('sale', (table) => {
      table.dropForeign('created_by_user_id');
      table.dropColumn('created_by_user_id');
      table.dropForeign('updated_by_user_id');
      table.dropColumn('updated_by_user_id');
      table.dropColumn('created_at');
      table.dropColumn('updated_at');
    }),
  ]);
};
