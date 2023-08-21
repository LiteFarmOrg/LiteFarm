export const up = async function (knex) {
  await knex.raw('DROP MATERIALIZED VIEW update_field_crop_view');
  await knex.schema.alterTable('users', (t) => {
    t.dropForeign('farm_id');
    t.dropColumn('farm_id');
  });
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
