export const up = async function (knex) {
  await knex.schema.createTable('document', (t) => {
    t.uuid('document_id').primary();
    t.string('name').notNullable();
    t.date('valid_until');
    t.enum('type', [
      'CLEANING_PRODUCT',
      'CROP_COMPLIANCE',
      'FERTILIZING_PRODUCT',
      'PEST_CONTROL_PRODUCT',
      'SOIL_AMENDMENT',
      'OTHER',
    ]);
    t.string('thumbnail_url');
    t.string('notes');
    t.uuid('farm_id').references('farm_id').inTable('farm').onDelete('CASCADE');
    t.boolean('deleted').defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  });
  await knex.schema.createTable('file', (t) => {
    t.uuid('file_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.uuid('document_id').references('document_id').inTable('document').onDelete('CASCADE');
    t.string('file_name').notNullable();
    t.string('url').notNullable();
    t.string('thumbnail_url').notNullable();
  });
};

export const down = async function (knex) {
  await knex.schema.dropTable('file');
  await knex.schema.dropTable('document');
};
