
export const up = function(knex) {
    const now = knex.fn.now();
    const litefarmUserId = 1;

    return Promise.all([
        knex.schema.createTable('nomination_type', (table) => {
            table.string('name').primary();
            table.dateTime('created_at').notNullable();
            table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
            table.dateTime('updated_at').notNullable();
            table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
            table.boolean('deleted').notNullable().defaultTo(false);
        }),
        knex.schema.createTable('nomination', (table) => {
            table.increments('nomination_id').primary();
            table.uuid('farm_id').references('farm_id').inTable('farm').notNullable();
            table.string('nominated_id').notNullable();
            table.string('nomination_type').references('name').inTable('nomination_type').notNullable();
            table.dateTime('created_at').notNullable();
            table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
            table.dateTime('updated_at').notNullable();
            table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
            table.boolean('deleted').notNullable().defaultTo(false);
        }),
        knex.schema.createTable('nomination_workflow', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('group').notNullable();
            table.dateTime('created_at').notNullable();
            table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
            table.dateTime('updated_at').notNullable();
            table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
            table.boolean('deleted').notNullable().defaultTo(false);
        }),
        knex.schema.createTable('nomination_status', (table) => {
            table.uuid('status_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
            table.integer('nomination_id').references('nomination_id').inTable('nomination').notNullable();
            table.integer('status').references('id').inTable('nomination_workflow').notNullable();
            table.string('notes');
            table.datetime('created_at').notNullable();
            table.string('created_by_user_id').references('user_id').inTable('users').notNullable();
            table.dateTime('updated_at').notNullable();
            table.string('updated_by_user_id').references('user_id').inTable('users').notNullable();
            table.boolean('deleted').notNullable().defaultTo(false);
        }),
        knex('nomination_type').insert([
            {
                name: 'CROP',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            }
        ]),
        knex('nomination_workflow').insert([
            {
                name: 'REJECTED',
                group: 'NOMINATION_REVIEW',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            },
            {
                name: 'APPROVED',
                group: 'NOMINATION_REVIEW',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            },
            {
                name: 'LF_REVIEW',
                group: 'NOMINATION_REVIEW',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            },
            {
                name: 'NOMINATED',
                group: 'NOMINATION_REVIEW',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            },
            {
                name: 'EXPERT_REVIEW',
                group: 'NOMINATION_REVIEW',
                created_at: now,
                created_by_user_id: litefarmUserId,
                updated_at: now,
                updated_by_user_id: litefarmUserId
            }
        ]),
    ]);
};

export const down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('nomination_status'),
        knex.schema.dropTable('nomination_workflow'),
        knex.schema.dropTable('nomination'),
        knex.schema.dropTable('nomination_type'),        
      ]);
};
