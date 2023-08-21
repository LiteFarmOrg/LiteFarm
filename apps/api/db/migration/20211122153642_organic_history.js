const NEW_PERMISSION_ID = 130;

export const up = async function (knex) {
  await knex.schema.createTable('organic_history', (t) => {
    t.uuid('organic_history_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.uuid('location_id').references('location_id').inTable('location').notNullable();
    t.enu('organic_status', ['Non-Organic', 'Transitional', 'Organic']).defaultTo('Non-Organic');
    t.date('effective_date').notNullable();
    t.boolean('deleted').notNullable().defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  });

  const query = `insert into organic_history (location_id, organic_status, effective_date, created_at, updated_at, created_by_user_id, updated_by_user_id)
    select location_id, organic_status, '2000-01-01', NOW(), NOW(), '1', '1' from`;

  for (const table of ['field', 'garden', 'greenhouse']) {
    await knex.raw(`${query} ${table};`);
  }

  return Promise.all([
    knex('permissions').insert([
      {
        permission_id: NEW_PERMISSION_ID,
        name: 'add:organic_history',
        description: 'Add an organic history entry',
      },
    ]),
    knex('rolePermissions').insert([
      { role_id: 1, permission_id: NEW_PERMISSION_ID },
      { role_id: 2, permission_id: NEW_PERMISSION_ID },
      { role_id: 5, permission_id: NEW_PERMISSION_ID },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('organic_history'),
    knex('rolePermissions').where('permission_id', NEW_PERMISSION_ID).del(),
    knex('permissions').where('permission_id', NEW_PERMISSION_ID).del(),
  ]);
};
