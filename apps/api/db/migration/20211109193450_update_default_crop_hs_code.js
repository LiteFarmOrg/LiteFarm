import cropsWithHsCode from '../seeds/seedData/cropHscodeByCropCommonNameV2.json' assert { type: 'json' };
import { getCropUniqueIdentifier } from '../util.js';

export const up = async function (knex) {
  if (process.env.NODE_ENV !== 'test') {
    for (const cropWithHsCode of cropsWithHsCode.filter(({ hs_code_id }) => hs_code_id)) {
      const hs_code_id = cropWithHsCode.hs_code_id;
      const crops = await knex('crop')
        .where(getCropUniqueIdentifier(cropWithHsCode))
        .update({ hs_code_id })
        .returning('*');
      if (crops.length > 0) {
        const crop = crops[0];
        const userCreatedCrops = await knex('crop')
          .whereNotNull('farm_id')
          .where('crop_common_name', 'ilike', `%${crop.crop_common_name}%`)
          .update({ hs_code_id })
          .returning('*');
        await knex('crop_variety').where({ crop_id: crop.crop_id }).update({ hs_code_id });
        for (const { crop_id } of userCreatedCrops) {
          await knex('crop_variety').where({ crop_id }).update({ hs_code_id });
        }
      }
    }
  }
};

export const down = async function (knex) {
  await knex('crop').update({
    hs_code_id: null,
  });
  await knex('crop_variety').update({
    hs_code_id: null,
  });
};
