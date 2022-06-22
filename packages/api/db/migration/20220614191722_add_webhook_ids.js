exports.up = async function (knex) {
  return knex.schema.alterTable('farm_external_integration', (table) => {
    table.integer('webhook_id');
  });
};

exports.down = async function (knex) {
  return knex.schema.alterTable('farm_external_integration', (table) => {
    table.dropColumns('webhook_id');
  });
};
