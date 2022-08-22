export const up = async function (knex) {
  await knex.schema.alterTable('beds', (t) => {
    t.integer('number_of_beds');
    t.integer('number_of_rows_in_bed');
    t.integer('plant_spacing');
    t.enu('plant_spacing_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('length_of_bed');
    t.enu('length_of_bed_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('planting_depth');
    t.enu('planting_depth_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('bed_width');
    t.enu('bed_width_unit', ['cm', 'm', 'ft', 'in']);
    t.integer('bed_spacing');
    t.enu('bed_spacing_unit', ['cm', 'm', 'ft', 'in']);
    t.string('planting_notes');
    t.string('specify_beds');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('beds', (t) => {
    t.dropColumn('number_of_beds');
    t.dropColumn('number_of_rows_in_bed');
    t.dropColumn('plant_spacing');
    t.dropColumn('plant_spacing_unit');
    t.dropColumn('length_of_bed');
    t.dropColumn('length_of_bed_unit');
    t.dropColumn('planting_depth');
    t.dropColumn('planting_depth_unit');
    t.dropColumn('bed_width');
    t.dropColumn('bed_width_unit');
    t.dropColumn('bed_spacing');
    t.dropColumn('bed_spacing_unit');
    t.dropColumn('planting_notes');
    t.dropColumn('specify_beds');
  });
};
