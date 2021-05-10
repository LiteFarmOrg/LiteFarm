exports.up = async function(knex) {
  await knex.schema.alterTable('crop', t => {
    t.string('crop_variety');
    t.dropUnique(['crop_common_name', 'crop_genus', 'crop_specie', 'farm_id']);
  });
  const crops = await knex('crop').where({});
  for (const crop of crops) {
    const [crop_common_name, crop_variety] = crop.crop_common_name.split(/ - (.*)/);
    const crop_translation_key = crop.farm_id ? crop_common_name : crop.crop_translation_key;
    await knex('crop').where({ crop_id: crop.crop_id }).update({
      crop_common_name,
      crop_variety: crop_variety || null,
      crop_translation_key,
    });
  }
};

exports.down = async function(knex) {
  const crops = await knex('crop').where({});
  for (const crop of crops) {
    const crop_common_name = crop.crop_variety ? `${crop.crop_common_name} - ${crop.crop_variety}` : crop.crop_common_name;
    const crop_translation_key = crop.farm_id ? crop_common_name : crop.crop_translation_key;
    await knex('crop').where({ crop_id: crop.crop_id }).update({ crop_common_name, crop_translation_key });
  }
  await knex.schema.alterTable('crop', t => {
    t.dropColumn('crop_variety');
    t.unique(['crop_common_name', 'crop_genus', 'crop_specie', 'farm_id']);
  });
};
