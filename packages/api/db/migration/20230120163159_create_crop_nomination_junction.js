export const up = async function (knex) {
  return await knex.schema.createTable('nomination_crop', (table) => {
    table.integer('nomination_id').references('nomination_id').inTable('nomination').notNullable();
    table.integer('crop_id').references('crop_id').inTable('crop').notNullable();
    table.primary(['nomination_id', 'crop_id']);
  });
};

export const down = async function (knex) {
  return await knex.schema.dropTable('nomination_crop');
};
