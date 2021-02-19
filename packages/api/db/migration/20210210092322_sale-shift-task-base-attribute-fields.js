exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('sale', (t) => {
      t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
      t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    }),
    knex.schema.alterTable('shiftTask', (t) => {
      t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
      t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
      t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    }),
  ]);
};
exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('sale', (t) => {
      t.dropForeign('created_by_user_id');
      t.dropColumn('created_by_user_id');
      t.dropForeign('updated_by_user_id');
      t.dropColumn('updated_by_user_id');
      t.dropColumn('created_at');
      t.dropColumn('updated_at');
    }),
    knex.schema.alterTable('shiftTask', (t) => {
      t.dropForeign('created_by_user_id');
      t.dropColumn('created_by_user_id');
      t.dropForeign('updated_by_user_id');
      t.dropColumn('updated_by_user_id');
      t.dropColumn('created_at');
      t.dropColumn('updated_at');
    }),

  ]);
};
