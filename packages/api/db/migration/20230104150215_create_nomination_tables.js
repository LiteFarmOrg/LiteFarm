export const up = async function (knex) {
  const now = knex.fn.now();
  const litefarmUserId = 1;

  await knex.schema.createTable('nomination_type', (table) => {
    table.string('nomination_type').primary();
    table.string('workflow_group').unique().notNullable();
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
    table.string('assignee_user_id').references('user_id').inTable('users').nullable();
    table.dateTime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.createTable('nomination_workflow', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('group').references('workflow_group').inTable('nomination_type').notNullable();
    table.unique(['name', 'group']);
    table.dateTime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex.schema.createTable('nomination_status', (table) => {
    table.uuid('status_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    table.integer('nomination_id').references('nomination_id').inTable('nomination').notNullable();
    table.integer('workflow_id').references('id').inTable('nomination_workflow').notNullable();
    table.text('notes');
    table.datetime('created_at').notNullable();
    table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
    table.dateTime('updated_at').notNullable();
    table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
  });
  await knex('nomination_type').insert([
    {
      nomination_type: 'CROP',
      workflow_group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
  ]);
  await knex('nomination_workflow').insert([
    {
      name: 'REJECTED',
      group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      name: 'APPROVED',
      group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      name: 'LF_REVIEW',
      group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      name: 'NOMINATED',
      group: 'CROP_NOMINATION',
      created_at: now,
      created_by_user_id: litefarmUserId,
      updated_at: now,
      updated_by_user_id: litefarmUserId,
    },
    {
      name: 'EXPERT_REVIEW',
      group: 'CROP_NOMINATION',
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
