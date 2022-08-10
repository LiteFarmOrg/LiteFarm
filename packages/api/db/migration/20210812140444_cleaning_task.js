export const up = function (knex) {
  return Promise.all([
    knex('task_type').insert({
      task_name: 'Cleaning',
      task_translation_key: 'CLEANING',
    }),
    knex('task_type').where({ task_name:'AUG_20201_MIGRATION_PLACEHOLDER' }).del(),
    knex.raw('ALTER TABLE task ALTER COLUMN type DROP DEFAULT'),
    knex.schema.createTable('cleaning_task', (t) => {
      t.integer('task_id').references('task_id').inTable('task').primary();
      t.integer('product_id').references('product_id').inTable('product');
      t.string('cleaning_target');
      t.boolean('agent_used');
      t.decimal('water_usage', 36, 12);
      t.enu('water_usage_unit', [ 'l', 'ml', 'gal', 'fl-oz' ]).defaultTo('l');
      t.decimal('product_quantity', 36, 12);
      t.enu('product_quantity_unit', [ 'l', 'ml', 'gal', 'fl-oz' ]).defaultTo('l');
    }),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.dropTable('cleaning_task'),
    knex('task_type').where({ task_translation_key: 'CLEANING' }).del(),
  ])
};
