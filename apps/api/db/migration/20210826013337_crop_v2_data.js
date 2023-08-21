import * as dotenv from 'dotenv';
dotenv.config();
import * as lodash from 'lodash';
const { pick } = lodash;
import crops from '../seeds/seedData/cropV2.js';
const getBucketName = () => {
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'production') return 'litefarmapp';
  if (environment === 'integration') return 'litefarmbeta';
  return 'litefarm';
};
const getCropPhotoUrl = (crop_photo_name) =>
  `https://${getBucketName()}.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/${
    crop_photo_name || 'default.webp'
  }`;
const getCrop = (crop) => {
  const newCrop = {
    ...crop,
    crop_photo_url: getCropPhotoUrl(crop.image_name),
    image_name: undefined,
    reviewed: true,
  };
  delete newCrop.image_name;
  delete newCrop.crop_id;
  return newCrop;
};
const getCropVariety = (crop) => {
  const newCropVariety = {
    ...crop,
    crop_variety_photo_url: getCropPhotoUrl(crop.image_name),
  };
  delete newCropVariety.image_name;
  delete newCropVariety.crop_common_name;
  delete newCropVariety.crop_genus;
  delete newCropVariety.crop_specie;
  delete newCropVariety.crop_group;
  delete newCropVariety.crop_subgroup;
  if ([132, 145].includes(newCropVariety.crop_id)) delete newCropVariety.crop_translation_key;
  return newCropVariety;
};
const updateCropId = async (knex, prevCropId, newCropId) => {
  await knex('crop_variety').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('cropDisease').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('cropSale').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('waterBalance').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('price').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('yield').where({ crop_id: prevCropId }).update({ crop_id: newCropId });
  await knex('crop').where({ crop_id: prevCropId }).delete();
};

export const up = async function (knex) {
  if (process.env.NODE_ENV !== 'test') {
    await updateCropId(knex, 16, 12);
    await updateCropId(knex, 18, 12);
    await updateCropId(knex, 135, 134);

    for (const crop of crops) {
      if (crop.crop_id) {
        const updated = await knex('crop')
          .where({ crop_id: crop.crop_id })
          .whereNull('farm_id')
          .update(getCrop(crop));
        !updated && (await knex('crop').insert(getCrop(crop)));
        await knex('crop_variety').where({ crop_id: crop.crop_id }).update(getCropVariety(crop));
      } else {
        await knex('crop').insert(getCrop(crop));
      }
    }
    const cropsInDb = await knex('crop');
    const cropsToUpdateUrl = cropsInDb.filter((crop) => crop.crop_photo_url.includes('/v1/'));
    for (const { crop_id, crop_photo_url } of cropsToUpdateUrl) {
      const newUrl = crop_photo_url.replace('/v1/', '/v2/');
      await knex('crop').where({ crop_id }).update({ crop_photo_url: newUrl });
      await knex('crop_variety').where({ crop_id }).update({ crop_variety_photo_url: newUrl });
    }
  }
};

export const down = function (knex) {
  if (process.env.NODE_ENV !== 'test') {
    return Promise.all(
      crops
        .filter((crop) => !crop.crop_id)
        .map((crop) =>
          knex('crop')
            .where({
              ...pick(crop, ['crop_common_name', 'crop_genus', 'crop_specie']),
              farm_id: null,
            })
            .delete(),
        ),
    );
  }
};
