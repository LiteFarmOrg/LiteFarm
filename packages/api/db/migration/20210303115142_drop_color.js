
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('figure', (t) => {
      t.dropColumn('main_color');
      t.dropColumn('hover_color');
      t.dropColumn('line_type');
    }),
    knex.schema.alterTable('custom_location', (t) => {
      t.string('main_color', 6);
      t.string('hover_color', 6);
      t.string('line_type');
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('figure', (t) => {
      t.string('main_color', 6);
      t.string('hover_color', 6);
      t.string('line_type');
    }),
    knex.schema.alterTable('custom_location', (t) => {
      t.dropColumn('main_color');
      t.dropColumn('hover_color');
      t.dropColumn('line_type');
    }),
  ])
};
