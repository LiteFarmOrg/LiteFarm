export const up = async function (knex) {
  await knex.raw(
    'ALTER TABLE planting_management_plan DROP CONSTRAINT IF EXISTS planting_management_plan_management_plan_id_is_final_planting_m',
  );
  await knex.schema.alterTable('planting_management_plan', (t) => {
    t.boolean('is_final_planting_management_plan').defaultTo(null).nullable().alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('planting_management_plan', (t) => {
    t.boolean('is_final_planting_management_plan').defaultTo(true).notNullable().alter();
    t.unique(['management_plan_id', 'is_final_planting_management_plan']);
  });
};
