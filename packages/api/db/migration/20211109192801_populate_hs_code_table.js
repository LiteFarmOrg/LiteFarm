require('dotenv').config();
const crops = require('../seeds/seedData/cropHscodeV2');
exports.up = function(knex) {
  if (process.env.NODE_ENV !== 'test') {
    const hsCodesMap = Object.keys(crops).reduce((hsCodesMap, crop_id) => {
      const hsCode = Number(crops[crop_id]['HS Code']);
      hsCode && (hsCodesMap[Number(crops[crop_id]['HS Code'])] = crops[crop_id]['HS Code Product']);
      return hsCodesMap;
    }, {});
    const hsCodes = Object.keys(hsCodesMap).map(hs_code => ({
      hs_code_id: Number(hs_code),
      description: hsCodesMap[hs_code],
    }));
    return knex.batchInsert('hs_code', hsCodes);
  }
};

exports.down = function(knex) {
  return knex('hs_code').delete();
};
