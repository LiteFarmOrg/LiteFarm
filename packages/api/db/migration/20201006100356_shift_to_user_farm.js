exports.up = async function (knex) {
  const shifts = await knex.raw(`
    SELECT distinct s.shift_id , s.start_time, s.end_time, s.user_id,
    s.break_duration, s.mood, s.wage_at_moment, uf."farm_id"
    from shift s, "shiftTask" st, field f, "userFarm" uf, "fieldCrop" fc
    where s.shift_id=st.shift_id 
    and (st.field_id=f.field_id or (fc.field_crop_id=st.field_crop_id and fc.field_id = f.field_id)) 
    and f.farm_id=uf.farm_id
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
