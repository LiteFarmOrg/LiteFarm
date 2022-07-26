exports.up = async function (knex) {
  return await knex.schema.alterTable('farm_external_integration', (table) => {
    table.dropColumn('webhook_address');
  });
};

exports.down = async function (knex) {
  return await knex.schema.alterTable('farm_external_integration', (table) => {
    table.integer('webhook_address');
  });
};
