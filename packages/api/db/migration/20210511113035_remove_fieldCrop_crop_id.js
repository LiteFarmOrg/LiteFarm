exports.up = function(knex) {
  return knex.schema.alterTable('fieldCrop', t => {
    t.dropColumn('crop_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('fieldCrop', table => {
    table.integer('crop_id')
      .references('crop_id')
      .inTable('crop');
  });
  const fieldCrops = await knex('fieldCrop').select('fieldCrop.field_crop_id', 'crop_variety.crop_variety_id', 'crop_variety.crop_id')
    .join('crop_variety', 'crop_variety.crop_variety_id', 'fieldCrop.crop_variety_id')
    .where({});
  for (const fieldCrop of fieldCrops) {
    await knex('fieldCrop').where({ field_crop_id: fieldCrop.field_crop_id }).update({ crop_id: fieldCrop.crop_id });
  }
  await knex.schema.alterTable('fieldCrop', table => {
    table.integer('crop_id').notNullable().alter();
  });
};
