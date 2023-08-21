export const up = async function (knex) {
  await knex.schema.alterTable('product', (t) => {
    t.dropColumn('on_permitted_substances_list');
  });
  return knex.schema.alterTable('product', (t) => {
    t.enum('on_permitted_substances_list', ['YES', 'NO', 'NOT_SURE']);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('product', (t) => {
    t.dropColumn('on_permitted_substances_list');
  });
  return knex.schema.alterTable('product', (t) => {
    t.boolean('on_permitted_substances_list');
  });
};
