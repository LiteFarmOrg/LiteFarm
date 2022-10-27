export const up = async function (knex) {
  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.decimal('estimated_price_per_mass', 36, 12);
    t.enu('estimated_price_per_mass_unit', ['kg', 'lb', 'mt', 't']).defaultTo('kg');
  });
  const cmp = await knex.raw(`
    select mp.management_plan_id, f.units
      from "management_plan" mp, "crop_variety" cv, "farm" f
      where mp.crop_variety_id = cv.crop_variety_id and cv.farm_id = f.farm_id;
  `);
  await Promise.all(
    cmp.rows.map((cmpRow) => {
      const { management_plan_id, units } = cmpRow;
      const unit = units['measurement'] === 'imperial' ? 'lb' : 'kg';
      return knex('crop_management_plan')
        .where({ management_plan_id })
        .update({ estimated_price_per_mass_unit: unit });
    }),
  );
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('estimated_price_per_mass');
    t.dropColumn('estimated_price_per_mass_unit');
  });
};
