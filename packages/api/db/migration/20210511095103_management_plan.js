exports.up = async function(knex) {
  await knex.schema.table('fieldCrop', t => {
    t.uuid('crop_variety_id').references('crop_variety_id').inTable('crop_variety');
  });
  const fieldCrops = await knex('fieldCrop').distinct('fieldCrop.field_crop_id', 'crop_variety.crop_variety_id')
    .join('crop_variety', 'crop_variety.crop_id', 'fieldCrop.crop_id')
    .where({});
  for (const fieldCrop of fieldCrops) {
    await knex('fieldCrop').where({ field_crop_id: fieldCrop.field_crop_id }).update({ crop_variety_id: fieldCrop.crop_variety_id });
  }
};

exports.down = function(knex) {
  return knex.schema.alterTable('fieldCrop', t => {
    t.dropColumn('crop_variety_id');
  });
};
