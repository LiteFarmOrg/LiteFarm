export const up = async function (knex) {
  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['kg', 'lb', 'mt', 't']).defaultTo('kg');
  });
  const plantingManagementPlans = await knex('planting_management_plan').where(
    'is_final_planting_management_plan',
    true,
  );
  for (const planting_management_plan of plantingManagementPlans) {
    await knex('crop_management_plan')
      .where({ management_plan_id: planting_management_plan.management_plan_id })
      .update({
        estimated_yield: planting_management_plan.estimated_yield,
        estimated_yield_unit: planting_management_plan.estimated_yield_unit,
      });
  }
  await knex.schema.alterTable('planting_management_plan', (t) => {
    t.dropColumn('estimated_yield');
    t.dropColumn('estimated_yield_unit');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('planting_management_plan', (t) => {
    t.decimal('estimated_yield', 36, 12);
    t.enu('estimated_yield_unit', ['kg', 'lb', 'mt', 't']).defaultTo('kg');
  });
  const plantingManagementPlans = await knex('crop_management_plan');
  for (const planting_management_plan of plantingManagementPlans) {
    await knex('planting_management_plan')
      .where({
        management_plan_id: planting_management_plan.management_plan_id,
        is_final_planting_management_plan: true,
      })
      .update({
        estimated_yield: planting_management_plan.estimated_yield,
        estimated_yield_unit: planting_management_plan.estimated_yield_unit,
      });
  }
  await knex.schema.alterTable('crop_management_plan', (t) => {
    t.dropColumn('estimated_yield');
    t.dropColumn('estimated_yield_unit');
  });
};
