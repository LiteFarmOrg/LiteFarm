exports.up = async function (knex) {
  const crops = await knex('crop');
  await knex.schema.alterTable('crop_variety', (t) => {
    t.decimal('protein').nullable();
    t.decimal('lipid').nullable();
    t.decimal('ph').nullable();
    t.decimal('energy').nullable();
    t.decimal('ca').nullable();
    t.decimal('fe').nullable();
    t.decimal('mg').nullable();
    t.decimal('k').nullable();
    t.decimal('na').nullable();
    t.decimal('zn').nullable();
    t.decimal('cu').nullable();
    t.decimal('mn').nullable();
    t.decimal('vita_rae').nullable();
    t.decimal('vitc').nullable();
    t.decimal('thiamin').nullable();
    t.decimal('riboflavin').nullable();
    t.decimal('niacin').nullable();
    t.decimal('vitb6').nullable();
    t.decimal('folate').nullable();
    t.decimal('vitb12').nullable();
    t.decimal('nutrient_credits').nullable();
  });
  const varietals = await knex('crop_variety');
  return Promise.all(varietals.map(({ crop_id, crop_variety_id }) => {
    const crop = crops.find((crop) => crop.crop_id === crop_id)
    const { protein, lipid, ph, energy, ca, fe, mg, k, na, zn, cu, mn, vita_rae, vitc, thiamin,
      riboflavin, niacin, vitb6, folate, vitb12, nutrient_credits } = crop;
    return knex('crop_variety').update({ protein, lipid, ph, energy, ca, fe, mg, k, na, zn, cu, mn,
      vita_rae, vitc, thiamin, riboflavin, niacin, vitb6, folate, vitb12, nutrient_credits }).where({ crop_variety_id });
  }))

};

exports.down = function (knex) {
  return knex.schema.alterTable('crop_variety', (t) => {
    t.dropColumn('protein');
    t.dropColumn('lipid');
    t.dropColumn('ph');
    t.dropColumn('energy');
    t.dropColumn('ca');
    t.dropColumn('fe');
    t.dropColumn('mg');
    t.dropColumn('k');
    t.dropColumn('na');
    t.dropColumn('zn');
    t.dropColumn('cu');
    t.dropColumn('mn');
    t.dropColumn('vita_rae');
    t.dropColumn('vitc');
    t.dropColumn('thiamin');
    t.dropColumn('riboflavin');
    t.dropColumn('niacin');
    t.dropColumn('vitb6');
    t.dropColumn('folate');
    t.dropColumn('vitb12');
    t.dropColumn('nutrient_credits');
  })
};
