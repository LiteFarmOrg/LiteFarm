exports.up = async function (knex) {
  await knex.schema.createTable('location', (t) => {
    t.uuid('location_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.uuid('farm_id').references('farm_id').inTable('farm');
  })
  await Promise.all([
    knex.schema.createTable('area', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').unique().onDelete('CASCADE');
      t.string('area_name').notNullable();
      t.decimal('total_area').notNullable();
      t.jsonb('grid_points').notNullable();
      t.decimal('perimeter').nullable();
      t.string('notes').nullable();
    }),
    knex.schema.createTable('line', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').unique().onDelete('CASCADE');
      t.string('line_name').notNullable();
      t.decimal('length').notNullable();
      t.decimal('width').nullable();
      t.jsonb('line_points').notNullable();
      t.string('notes').nullable();
    }),
    knex.schema.createTable('point', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').unique().onDelete('CASCADE');
      t.string('point_name').notNullable();
      t.jsonb('point').notNullable();
      t.string('notes').nullable();
    }),
  ]);
  await knex.raw('DROP MATERIALIZED VIEW update_field_crop_view');
  const fields = await knex('field');
  await Promise.all(fields.map((field) => knex('location').insert({ location_id: field.field_id, farm_id: field.farm_id })));
  await Promise.all(fields.map((field) => {
    knex('area').insert({ location_id: field.field_id, area_name: field.field_name, total_area: field.area, grid_points: field.grid_points })
  }));
  await knex.schema.alterTable('fieldCrop', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('activityFields', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('shiftTask', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('field', (t) => {
    t.dropForeign('farm_id');
    t.dropColumn('farm_id');
    t.dropColumn('grid_points');
    t.dropColumn('field_name');
    t.dropColumn('area');
    t.foreign('field_id').references('location_id').inTable('area');
  });


};

exports.down = function (knex) {

};
