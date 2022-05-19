exports.up = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE transplant_task 
      ALTER COLUMN planting_management_plan_id SET NOT NULL,
      ALTER COLUMN prev_planting_management_plan_id SET NOT NULL;`),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.raw(`ALTER TABLE transplant_task 
      ALTER COLUMN planting_management_plan_id DROP NOT NULL,
      ALTER COLUMN prev_planting_management_plan_id DROP NOT NULL;`),
  ]);
};
