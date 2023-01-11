export const up = async function (knex) {
  const now = knex.fn.now();
  const litefarmUserId = 1;

  await knex.schema.createTable('nomination_type', (table) => {
    table.string('nomination_type').primary().notNullable();
    table.dateTime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.createTable('nomination', (table) => {
    table.increments('nomination_id').primary();
    table
      .string('nomination_type')
      .references('nomination_type')
      .inTable('nomination_type')
      .notNullable();
    table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
    table.dateTime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.createTable('nomination_workflow', (table) => {
    table.increments('workflow_id').primary();
    table.string('status').notNullable();
    table
      .string('type_group')
      .references('nomination_type')
      .inTable('nomination_type')
      .notNullable();
    table.unique(['name', 'type_group']);
    table.dateTime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.createTable('nomination_status', (table) => {
    table.uuid('status_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    table.integer('nomination_id').references('nomination_id').inTable('nomination').notNullable();
    table
      .integer('workflow_id')
      .references('workflow_id')
      .inTable('nomination_workflow')
      .notNullable();
    table.text('notes');
    table.datetime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex('nomination_type').insert([
    {
      nomination_type: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
  ]);
  await knex('nomination_workflow').insert([
    {
      status: 'REJECTED',
      type_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      status: 'APPROVED',
      type_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      status: 'LF_REVIEW',
      type_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      status: 'NOMINATED',
      type_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      status: 'EXPERT_REVIEW',
      type_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('nomination_status'),
    knex.schema.dropTable('nomination_workflow'),
    knex.schema.dropTable('nomination'),
    knex.schema.dropTable('nomination_type'),
  ]);
};
