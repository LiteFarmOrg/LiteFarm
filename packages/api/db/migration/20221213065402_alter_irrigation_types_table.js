export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_type', (table) => {
    table.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_type', (table) => {
    table.dropColumn('created_by_user_id');
    table.dropColumn('updated_by_user_id');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('deleted');
  });
};
