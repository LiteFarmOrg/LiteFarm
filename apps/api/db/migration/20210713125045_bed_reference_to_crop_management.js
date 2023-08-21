export const up = function (knex) {
  return knex.raw('ALTER TABLE beds DROP CONSTRAINT beds_management_plan_id_foreign').then(() => {
    return knex.raw(`ALTER TABLE beds ADD CONSTRAINT beds_management_plan_id_foreign 
                FOREIGN KEY (management_plan_id) REFERENCES crop_management_plan(management_plan_id)
                ON UPDATE NO ACTION
                ON DELETE CASCADE`);
  });
};

export const down = function (knex) {
  return knex.raw('ALTER TABLE beds DROP CONSTRAINT beds_management_plan_id_foreign').then(() => {
    return knex.raw(`ALTER TABLE beds ADD CONSTRAINT beds_management_plan_id_foreign 
                FOREIGN KEY (management_plan_id) REFERENCES management_plan(management_plan_id)
                ON UPDATE NO ACTION
                ON DELETE CASCADE`);
  });
};
