export const up = async function (knex) {
  await knex.schema.alterTable('location_defaults', (table) => {
    table.decimal('estimated_flow_rate', 36, 12).alter();
    table.decimal('application_depth', 36, 12).alter();
    table.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    table.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('location_defaults', (table) => {
    table.float('estimated_flow_rate').alter();
    table.float('application_depth').alter();
    table.dropColumn('created_by_user_id');
    table.dropColumn('updated_by_user_id');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('deleted');
  });
};
