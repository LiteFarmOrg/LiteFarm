exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('supportTicket', function (table) {
      table.uuid('support_ticket_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      // table.increments('support_ticket_number');
      table.enu('support_type',
        ['Request information', 'Report a bug', 'Request a feature', 'Other']).notNullable();
      table.text('message').notNullable();
      table.jsonb('attachments').defaultTo(JSON.stringify([]));
      table.enu('contact_method',
        ['email', 'whatsapp']).notNullable();
      table.string('email');
      table.string('whatsapp');
      table.enu('status',
        ['Open', 'Closed', 'In progress']).defaultTo('Open');
      table.uuid('farm_id').references('farm_id').inTable('farm');
      table.string('created_by_user_id').references('user_id').inTable('users');
      table.string('updated_by_user_id').references('user_id').inTable('users');
      table.dateTime('created_at').notNullable();
      table.dateTime('updated_at').notNullable();
      table.boolean('deleted').defaultTo(false);
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([knex.schema.dropTable('supportTicket')]);
};