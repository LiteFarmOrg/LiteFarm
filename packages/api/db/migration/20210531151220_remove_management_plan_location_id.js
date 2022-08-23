export const up = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('location_id');
  });
};

export const down = async function (knex) {
  const management_plans = await knex('management_plan').join(
    'crop_management_plan',
    'crop_management_plan.management_plan_id',
    'crop_management_plan.management_plan_id',
  );
  await knex.schema.alterTable('management_plan', (t) => {
    t.uuid('location_id').references('location_id').inTable('location');
  });
  await Promise.all(
    management_plans.map(({ management_plan_id, location_id }) =>
      knex('management_plan').where({ management_plan_id }).update({ location_id }),
    ),
  );
  await knex.schema.alterTable('management_plan', (t) => {
    t.uuid('location_id').notNullable().alter();
  });
};
