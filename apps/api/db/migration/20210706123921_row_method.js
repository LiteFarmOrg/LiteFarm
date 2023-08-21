export const up = async function (knex) {
  await knex.schema.createTable('rows', (t) => {
    t.integer('management_plan_id')
      .primary()
      .references('management_plan_id')
      .inTable('crop_management_plan');
    t.boolean('same_length').notNullable();
    t.integer('number_of_rows');
    t.decimal('row_length', 36, 12);
    t.enu('row_length_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('plant_spacing', 36, 12);
    t.enu('plant_spacing_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.integer('total_rows_length', 36, 12);
    t.enu('total_rows_length_unit', ['cm', 'm', 'km', 'in', 'ft', 'mi']).defaultTo('cm');
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
    t.integer('estimated_seeds', 36, 12);
    t.enu('estimated_seeds_unit', ['g', 'lb', 'kg', 'oz', 'l', 'gal']).defaultTo('kg');
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('rows');
};
