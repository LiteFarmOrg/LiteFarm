export const up = async function (knex) {
  await knex.schema.alterTable('rows', (t) => {
    t.string('specify_rows');
    t.decimal('planting_depth', 36, 12);
    t.enu('planting_depth_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('row_width', 36, 12);
    t.enu('row_width_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('row_spacing', 36, 12);
    t.enu('row_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.string('planting_notes');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('rows', (t) => {
    t.dropColumn('specify_rows');
    t.dropColumn('planting_depth');
    t.dropColumn('planting_depth_unit');
    t.dropColumn('row_width');
    t.dropColumn('row_width_unit');
    t.dropColumn('row_spacing');
    t.dropColumn('row_spacing_unit');
    t.dropColumn('planting_notes');
  });
};
