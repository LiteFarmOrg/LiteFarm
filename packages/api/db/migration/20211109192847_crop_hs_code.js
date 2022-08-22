export const up = async function (knex) {
  await knex.schema.alterTable('crop', (t) => {
    t.bigInteger('hs_code_id');
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.bigInteger('hs_code_id');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('crop', (t) => {
    t.dropColumn('hs_code_id');
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('hs_code_id');
  });
};
