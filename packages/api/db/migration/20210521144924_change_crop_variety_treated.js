export const up = async function (knex) {
  const cropVarieties = await knex('crop_variety');
  await knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('treated');
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.enum('treated', ['YES', 'NO', 'NOT_SURE']);
  });
  for (const { crop_variety_id, treated } of cropVarieties) {
    const getTreatedEnum = (treated) => {
      if (treated === true) return 'YES';
      else if (treated === false) return 'NO';
      return null;
    };
    await knex('crop_variety')
      .where({ crop_variety_id })
      .update({ treated: getTreatedEnum(treated) });
  }
};

export const down = async function (knex) {
  const cropVarieties = await knex('crop_variety');
  await knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('treated');
  });
  await knex.schema.alterTable('crop_variety', (t) => {
    t.boolean('treated');
  });
  for (const { crop_variety_id, treated } of cropVarieties) {
    const getTreatedBool = (treated) => {
      if (treated === 'YES') return true;
      else if (treated === 'NO') return false;
      return null;
    };
    await knex('crop_variety')
      .where({ crop_variety_id })
      .update({ treated: getTreatedBool(treated) });
  }
};
