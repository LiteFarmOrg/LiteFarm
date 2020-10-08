exports.up = async function (knex) {
  const shifts = await knex.raw(`
    select distinct shift.shift_id , "shift".start_time, "shift".end_time, "shift".user_id, 
    "shift".break_duration, "shift".mood, "shift".wage_at_moment, "userFarm"."farm_id" 
    from "shiftTask" left join "taskType" on "taskType"."task_id" = "shiftTask"."task_id" 
    left join "fieldCrop" on "fieldCrop"."field_crop_id" = "shiftTask"."field_crop_id"
    left join "field" on "fieldCrop"."field_id" = "field"."field_id" OR "field".field_id = "shiftTask".field_id
    inner join "shift" on "shiftTask"."shift_id" = "shift"."shift_id"
    inner join "userFarm" on "field"."farm_id" = "userFarm"."farm_id" and "shift"."user_id" = "userFarm"."user_id" 
    inner join "users" on "shift"."user_id" = "users"."user_id"
    `);
  const shiftTasks = await knex.select().from('shiftTask');
  await knex('shiftTask').del();
  await knex('shift').del();
  await knex.schema.alterTable('shift', (table) =>
    table.dropForeign('user_id', 'user_id')
  )
  await knex.schema.alterTable('shift', (table) => {
    table.foreign('user_id');
    table.uuid('farm_id');
    table.boolean('deleted').defaultTo(false);
    table.foreign(['farm_id', 'user_id']).references(['farm_id', 'user_id']).inTable('userFarm');
  })
  await knex.batchInsert('shift', shifts.rows);
  return knex.batchInsert('shiftTask', shiftTasks);
};

exports.down = function (knex) {
  return knex.schema.alterTable('shift', (table) => {
    table.dropForeign(['farm_id', 'user_id']);
    table.dropColumn('farm_id');
    table.dropColumn('deleted');
  }).then(() => {
    return knex.schema.alterTable('shift', (table) => {
      table.foreign('user_id', 'user_id').references('users.user_id');
    })
  })
};
