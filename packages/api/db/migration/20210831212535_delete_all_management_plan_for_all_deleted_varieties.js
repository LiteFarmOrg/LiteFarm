exports.up = async function(knex) {
  const deletedCrops = await knex('crop_variety').where({ deleted: true });
  await knex('management_plan').whereIn('crop_variety_id', deletedCrops.map(({ crop_variety_id }) => crop_variety_id)).update({ deleted: true });
};

exports.down = function(knex) {

};
