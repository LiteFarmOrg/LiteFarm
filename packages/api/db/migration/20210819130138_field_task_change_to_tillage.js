export const up = async function (knex) {
  await knex.raw(`
    ALTER TABLE "field_work_task"
    DROP CONSTRAINT "field_work_task_type_check";
  `);
  await knex('field_work_task').whereNotNull('type').update({ type: 'TILLAGE' });
  await knex.raw(`
    ALTER TABLE "field_work_task"
    ADD CONSTRAINT "field_work_task_type_check" 
    CHECK ("type" IN (
      'COVERING_SOIL',
      'FENCING',
      'PREPARING_BEDS_OR_ROWS',
      'PRUNING',
      'SHADE_CLOTH',
      'TERMINATION',
      'TILLAGE',
      'WEEDING',
      'OTHER'
    ));
  `);
};

export const down = async function (knex) {
  await knex.raw(`
    ALTER TABLE "field_work_task"
    DROP CONSTRAINT "field_work_task_type_check";
  `);
  await knex('field_work_task').where({ type: 'TILLAGE' }).update({ type: 'plow' });
  await knex.raw(`
    ALTER TABLE "field_work_task"
    ADD CONSTRAINT "field_work_task_type_check" 
    CHECK ("type" IN (
      'plow',
      'ridgeTill',
      'zoneTill',
      'mulchTill',
      'ripping',
      'discing'
    ));
  `);
};
