exports.up = function (knex) {
  return Promise.all([
    knex('task_type').insert({
      task_name: 'Cleaning',
      task_translation_key: 'CLEANING',
    }),
    knex.schema.createTable('cleaning_task', (t) => {
      t.integer('task_id').references('task_id').inTable('task').primary();
      t.integer('product_id').references('product_id').inTable('product');
      t.string('cleaning_target');
      t.boolean('agent_used');
      t.integer('water_usage');
      t.enu('water_usage_unit', [ 'l', 'ml', 'gal', 'fl-oz' ]).defaultTo('l');
      t.number('product_quantity');
      t.enu('product_quantity_unit', [ 'l', 'ml', 'gal', 'fl-oz' ]).defaultTo('l');
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.dropTable('cleaning_task'),
    knex('task_type').where({ task_translation_key: 'CLEANING' }).del()
  ])
};
