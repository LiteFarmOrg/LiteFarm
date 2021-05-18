exports.up = async function(knex) {
  const getBucketName = () => {
    const environment = process.env.NODE_ENV || 'development';
    if (environment === 'production') return 'litefarmapp';
    if (environment === 'integration') return 'litefarmbeta';
    return 'litefarm';
  };
  await knex.schema.alterTable('crop_variety', t => {
    t.string('crop_variety_photo_url').notNullable().defaultTo(`https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/default.jpg`);
  });
  const crops = await knex('crop').where({});
  for (const crop of crops) {
    await knex('crop_variety').where({ crop_id: crop.crop_id }).update({ crop_variety_photo_url: crop.crop_photo_url });
  }
};

exports.down = function(knex) {
  return knex.schema.alterTable('crop_variety', t => {
    t.dropColumn('crop_variety_photo_url');
  });
};
