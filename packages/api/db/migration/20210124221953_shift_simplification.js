exports.up = function (knex) {
  return knex('shift').select('*').then((shifts) => {
    return knex.schema.alterTable('shift', t => {
      t.dropColumn('start_time');
      t.dropColumn('end_time');
      t.dropColumn('break_duration');
      t.date('shift_date').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
      return Promise.all(shifts.map(({ start_time, shift_id }) =>
        knex('shift').where({ shift_id }).update({ shift_date: start_time }),
      ))
    })
  })
};

exports.down = function (knex) {
  return knex('shift').select('*').then((shifts) => {
    return knex.schema.alterTable('shift', t => {
      t.timestamp('start_time').notNullable().defaultTo(knex.fn.now());
      t.timestamp('end_time').notNullable().defaultTo(knex.fn.now());
      t.integer('break_duration').defaultTo(0);
      t.dropColumn('shift_date');
    }).then(() => {
      // OC: rolling this migration will take the date field "shift_date"
      // to be a timestamp field "start_time".
      return Promise.all(shifts.map(({ shift_date, shift_id }) =>
        knex('shift').where({ shift_id }).update({ start_time: shift_date, end_time: shift_date }),
      ))
    })
  })
};
