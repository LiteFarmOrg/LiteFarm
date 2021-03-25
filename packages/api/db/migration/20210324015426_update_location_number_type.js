exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('area', (t) => {
      t.decimal('total_area', 36, 12).notNullable().alter();
      t.decimal('perimeter', 36, 12).nullable().alter();
    }),
    knex.schema.alterTable('creek', (t) => {
      t.decimal('buffer_width', 36, 12).alter();
    }),
    knex.schema.alterTable('line', (t) => {
      t.decimal('length', 36, 12).notNullable().alter();
      t.decimal('width', 36, 12).nullable().alter();
    }),
    knex.schema.alterTable('water_valve', (t) => {
      t.decimal('flow_rate', 36, 12).alter();
    }),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('area', (t) => {
      t.decimal('total_area', 24, 2).notNullable().alter();
      t.decimal('perimeter', 24, 2).nullable().alter();
    }),
    knex.schema.alterTable('creek', (t) => {
      t.decimal('buffer_width', 24, 2).alter();
    }),
    knex.schema.alterTable('line', (t) => {
      t.decimal('length', 24, 2).notNullable().alter();
      t.decimal('width', 24, 2).nullable().alter();
    }),
    knex.schema.alterTable('water_valve', (t) => {
      t.decimal('flow_rate', 24, 2).alter();
    }),
  ]);
};
