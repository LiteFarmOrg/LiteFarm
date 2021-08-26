const { pick } = require('lodash');
const crops = require('../seeds/seedData/cropV2');
const getBucketName = () => {
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') return 'litefarmapp';
  if (environment === 'integration') return 'litefarmbeta';
  return 'litefarm';
};
const getCropPhotoUrl = crop_photo_name => `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/${crop_photo_name}`;
const getCrop = crop => {
  const newCrop = { ...crop, crop_photo_url: getCropPhotoUrl(crop.image_name), image_name: undefined };
  delete newCrop.image_name;
  return newCrop;
};
const getCropVariety = crop => {
  const newCropVariety = {
    ...crop, crop_variety_photo_url: getCropPhotoUrl(crop.image_name),
  };
  delete newCropVariety.image_name;
  delete newCropVariety.crop_common_name;
  delete newCropVariety.crop_genus;
  delete newCropVariety.crop_specie;
  delete newCropVariety.crop_group;
  delete newCropVariety.crop_subgroup;
  return newCropVariety;
};
exports.up = async function(knex) {
  for (const crop of crops) {
    if (crop.crop_id) {
      const updated = await knex('crop').where({ crop_id: crop.crop_id }).update(getCrop(crop));
      !updated && await knex('crop').insert(getCrop(crop));
      await knex('crop_variety').where({ crop_id: crop.crop_id }).update(getCropVariety(crop));
    } else {
      await knex('crop').insert(getCrop(crop));
    }
  }
};

exports.down = function(knex) {
  return Promise.all(crops.filter(crop => !crop.crop_id)
    .map(crop => knex('crop').where({
      ...pick(crop, ['crop_common_name', 'crop_genus', 'crop_specie']),
      farm_id: null,
    }).delete()));
};
