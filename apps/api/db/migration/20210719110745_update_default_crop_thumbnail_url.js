const getBucketName = () => {
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') return 'litefarmapp';
  if (environment === 'integration') return 'litefarmbeta';
  return 'litefarm';
};

export const up = async function (knex) {
  await knex.schema.alterTable('crop', (t) => {
    t.string('crop_photo_url')
      .notNullable()
      .defaultTo(
        `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/default.webp`,
      )
      .alter();
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.string('crop_variety_photo_url')
      .notNullable()
      .defaultTo(
        `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/default.webp`,
      )
      .alter();
  });
  const crops = await knex('crop');
  for (const crop of crops) {
    if (crop.crop_photo_url.includes('default_crop')) {
      const webpCropPhotoUrl = crop.crop_photo_url
        .replace('default_crop', 'default_crop/v1')
        .replace('.jpg', '.webp')
        .replace('.png', '.webp');
      await knex('crop').where('crop_id', crop.crop_id).update('crop_photo_url', webpCropPhotoUrl);
    }
  }
  const cropVarieties = await knex('crop_variety');
  for (const cropVariety of cropVarieties) {
    if (cropVariety.crop_variety_photo_url.includes('default_crop')) {
      const webpCropPhotoUrl = cropVariety.crop_variety_photo_url
        .replace('default_crop', 'default_crop/v1')
        .replace('.jpg', '.webp')
        .replace('.png', '.webp');
      await knex('crop_variety')
        .where('crop_variety_id', cropVariety.crop_variety_id)
        .update('crop_variety_photo_url', webpCropPhotoUrl);
    }
  }
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop', (t) => {
    t.string('crop_photo_url')
      .notNullable()
      .defaultTo(
        `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/default.jpg`,
      )
      .alter();
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.string('crop_variety_photo_url')
      .notNullable()
      .defaultTo(
        `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/default.jpg`,
      )
      .alter();
  });
  const crops = await knex('crop');
  for (const crop of crops) {
    if (crop.crop_photo_url.includes('default_crop')) {
      const webpCropPhotoUrl = crop.crop_photo_url
        .replace('default_crop/v1', 'default_crop')
        .replace('.webp', '.jpg');
      await knex('crop').where('crop_id', crop.crop_id).update('crop_photo_url', webpCropPhotoUrl);
    }
  }
  const cropVarieties = await knex('crop_variety');
  for (const cropVariety of cropVarieties) {
    if (cropVariety.crop_variety_photo_url.includes('default_crop')) {
      const webpCropPhotoUrl = cropVariety.crop_variety_photo_url
        .replace('default_crop/v1', 'default_crop')
        .replace('.webp', '.jpg');
      await knex('crop_variety')
        .where('crop_variety_id', cropVariety.crop_variety_id)
        .update('crop_variety_photo_url', webpCropPhotoUrl);
    }
  }
};
