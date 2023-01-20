export const up = async function (knex) {
  return knex.schema.alterTable('crop', (table) => {
    table.integer('nomination_id').references('nomination_id').inTable('nomination').nullable();
  });
};

export const down = async function (knex) {
  return knex.schema.alterTable('crop', (table) => {
    table.dropColumns('nomination_id');
  });
};
