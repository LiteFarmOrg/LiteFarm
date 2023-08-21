export const up = async function (knex) {
  return await knex.schema.createTable('test', function (table) {
    table.string('message');
  });
};

export const down = async function (knex) {
  return await knex.schema.dropTable('test');
};
