export const up = function (knex) {
  return Promise.all([
    knex.schema.createTable('location_defaults', (t) => {
      t.uuid('location_id').primary().references('location_id').inTable('location');
      t.string('irrigation_task_type');
      t.float('estimated_flow_rate');
      t.string('estimated_flow_rate_unit');
      t.float('application_depth');
      t.string('application_depth_unit');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex.schema.dropTable('location_defaults')]);
};
