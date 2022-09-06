export const up = async function (knex) {
  await knex.schema.alterTable('sensor', (table) => {
    table.enu('depth_unit', ['cm', 'm', 'in', 'ft']).defaultTo('cm');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('sensor', (table) => {
    table.dropColumns('depth_unit');
  });
};
