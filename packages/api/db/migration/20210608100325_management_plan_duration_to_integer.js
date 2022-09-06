export const up = async function (knex) {
  await knex.schema.table('management_plan', (table) => {
    table.dropColumn('transplant_days');
    table.dropColumn('germination_days');
    table.dropColumn('termination_days');
    table.dropColumn('harvest_days');
  });
  await knex.schema.table('management_plan', (table) => {
    table.integer('transplant_days').unsigned();
    table.integer('germination_days').unsigned();
    table.integer('termination_days').unsigned();
    table.integer('harvest_days').unsigned();
  });
};

export const down = async function (knex) {
  await knex.schema.table('management_plan', (table) => {
    table.dropColumn('transplant_days');
    table.dropColumn('germination_days');
    table.dropColumn('termination_days');
    table.dropColumn('harvest_days');
  });
  return knex.schema.table('management_plan', (table) => {
    table.date('transplant_days');
    table.date('germination_days');
    table.date('termination_days');
    table.date('harvest_days');
  });
};
