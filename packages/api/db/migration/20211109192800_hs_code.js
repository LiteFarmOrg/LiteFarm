export const up = function (knex) {
  return knex.schema.createTable('hs_code', (t) => {
    t.bigInteger('hs_code_id').primary().notNullable();
    t.text('description').notNullable();
  });
};

export const down = function (knex) {
  return knex.schema.dropTable('hs_code');
};
