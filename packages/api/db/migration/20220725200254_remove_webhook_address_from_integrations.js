export const up = async function (knex) {
  return await knex.schema.alterTable('farm_external_integration', (table) => {
    table.dropColumn('webhook_address');
  });
};

export const down = async function (knex) {
  return await knex.schema.alterTable('farm_external_integration', (table) => {
    table.string('webhook_address');
  });
};
