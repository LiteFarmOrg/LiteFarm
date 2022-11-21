export const up = function (knex) {
  return Promise.all([
    knex.schema.createTable('location_defaults', (t) => {
      t.uuid('location_id').primary().references('location_id').inTable('location');
      t.string('irrigation_task_type');
      t.float('flow_rate');
      t.jsonb('flow_rate_unit');
      t.float('application_depth');
      t.jsonb('application_depth_unit');
      t.boolean('default_application_depth').defaultTo(false);
      t.boolean('default_flow_rate').defaultTo(false);
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex.schema.dropTable('location_defaults')]);
};
