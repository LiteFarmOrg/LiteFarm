export const up = function (knex) {
  return Promise.all([
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT "fieldCrop_pkey" TO management_plan_pkey',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT "fieldcrop_created_by_user_id_foreign" TO management_plan_created_by_user_id_foreign',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT "fieldcrop_updated_by_user_id_foreign" TO management_plan_updated_by_user_id_foreign',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT "fieldcrop_crop_variety_id_foreign" TO management_plan_crop_variety_id_foreign',
    ),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT management_plan_pkey TO "fieldCrop_pkey"',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT management_plan_created_by_user_id_foreign TO "fieldcrop_created_by_user_id_foreign"',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT management_plan_updated_by_user_id_foreign TO "fieldcrop_updated_by_user_id_foreign"',
    ),
    knex.raw(
      'ALTER TABLE management_plan RENAME CONSTRAINT management_plan_crop_variety_id_foreign TO "fieldcrop_crop_variety_id_foreign"',
    ),
  ]);
};
