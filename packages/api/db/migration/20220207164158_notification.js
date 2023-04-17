export const up = async function (knex) {
  await knex.schema.createTable('notification', function (table) {
    table.uuid('notification_id').primary();
    table.string('title').notNullable();
    table.text('body').notNullable();
    table.enum('ref_table', [
      'task',
      'location',
      'users',
      'farm',
      'document',
      'export',
      // 'observation', 'weather', 'sensor', 'irrigation', 'insight',
    ]);
    table.enum('ref_subtable', [
      'cleaning_task',
      'field_work_task',
      'harvest_task',
      'irrigation_task',
      'location_tasks',
      'management_tasks',
      'pest_control_task',
      'plant_task',
      'sale_task',
      'scouting_task',
      'shiftTask',
      'social_task',
      'soil_task',
      'soil_amendment_task',
      'transplant_task',
      'transport_task',
      'wash_and_pack_task',
      'area',
      'barn',
      'buffer_zone',
      'ceremonial_area',
      'farm_site_boundary',
      'fence',
      'field',
      'figure',
      'garden',
      'gate',
      'greenhouse',
      'line',
      'natural_area',
      'point',
      'residence',
      'surface_water',
      'watercourse',
      'water_valve',
    ]);
    table.string('ref_pk');
    table.uuid('farm_id').references('farm_id').inTable('farm');
    table.boolean('deleted').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
  });

  await knex.schema.createTable('notification_user', function (table) {
    table.primary(['notification_id', 'user_id']);
    table.uuid('notification_id').references('notification_id').inTable('notification');
    table.string('user_id').references('user_id').inTable('users');
    table.boolean('alert').defaultTo(true).notNullable();
    table.enum('status', ['Unread', 'Read', 'Archived']).defaultTo('Unread').notNullable();
    table.boolean('deleted').defaultTo(false);
    table.string('created_by_user_id').references('user_id').inTable('users');
    table.string('updated_by_user_id').references('user_id').inTable('users');
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('notification_user');
  await knex.schema.dropTable('notification');
};
