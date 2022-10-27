export const up = async function (knex) {
  const deletedCrops = await knex('crop_variety').where({ deleted: true });
  await knex('management_plan')
    .whereIn(
      'crop_variety_id',
      deletedCrops.map(({ crop_variety_id }) => crop_variety_id),
    )
    .update({ deleted: true });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
