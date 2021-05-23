exports.up = async function (knex) {
  await knex.schema.alterTable('pesticide', (t) => {
    t.string('pesticide_translation_key');
  })
  const pesticides = await knex('pesticide');
  await Promise.all(pesticides.map((p) => knex('pesticide').update({ pesticide_translation_key: p.pesticide_name })));
  await knex('pesticide').update({ pesticide_translation_key: 'ROUNDUP' }).where({ pesticide_id: 1 });
  return knex.batchInsert('pesticide', [{
    pesticide_name: 'Dipel 2X DF',
    pesticide_translation_key: 'DIPEL',
  }, {
    pesticide_name: 'Neem oil',
    pesticide_translation_key: 'NEEM_OIL',
  }, {
    pesticide_name: 'Sulfocalcium Syrup',
    pesticide_translation_key: 'SULFOCALCIUM_SYRUP',
  }, {
    pesticide_name: 'Bordeaux mixture',
    pesticide_translation_key: 'BORDEAUX_MIXTURE',
  }])
};

exports.down = function (knex) {
  return knex.schema.alterTable('pesticide', (t) => {
    t.dropColumn('pesticide_translation_key');
  })
};
