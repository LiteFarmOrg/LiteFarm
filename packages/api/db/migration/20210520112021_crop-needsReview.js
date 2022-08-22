export const up = async function (knex) {
  await knex.schema.alterTable('crop', (t) => {
    t.boolean('reviewed').defaultTo(false);
  });
  return knex('crop').update({ reviewed: true }).whereNull('farm_id');
};

export const down = function (knex) {
  return knex.schema.alterTable('crop', (t) => {
    t.dropColumn('reviewed');
  });
};
