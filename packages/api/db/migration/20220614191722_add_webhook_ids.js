exports.up = async function (knex) {
  return knex.schema.alterTable('farmExternalIntegrations', (table) => {
    table.integer('webhook_id');
  });
};

exports.down = async function (knex) {
  return knex.schema.alterTable('farmExternalIntegrations', (table) => {
    table.dropColumns('webhook_id');
  });
};
