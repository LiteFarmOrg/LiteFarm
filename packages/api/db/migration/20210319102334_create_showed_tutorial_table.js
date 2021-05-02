
exports.up = async function(knex) {
  await knex.schema.createTable('showedSpotlight', (t) => {
    t.string('user_id').primary().references('user_id').inTable('users');

    t.boolean('map').defaultTo(false);
    t.timestamp('map_end').nullable().defaultTo(null);

    t.boolean('draw_area').defaultTo(false);
    t.timestamp('draw_area_end').nullable().defaultTo(null);

    t.boolean('draw_line').defaultTo(false);
    t.timestamp('draw_line_end').nullable().defaultTo(null);

    t.boolean('drop_point').defaultTo(false);
    t.timestamp('drop_point_end').nullable().defaultTo(null);

    t.boolean('adjust_area').defaultTo(false);
    t.timestamp('adjust_area_end').nullable().defaultTo(null);

    t.boolean('adjust_line').defaultTo(false);
    t.timestamp('adjust_line_end').nullable().defaultTo(null);
  });

  const users = await knex.select('user_id').from('users');
  for (const user of users) {
    await knex('showedSpotlight').insert({
      user_id: user.user_id,
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTable('showedSpotlight');
};
