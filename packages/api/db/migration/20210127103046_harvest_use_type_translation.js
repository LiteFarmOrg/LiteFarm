exports.up = function (knex) {
  return knex.schema.alterTable('harvestUseType', (t) => {
    t.string('harvest_use_type_translation_key')
  }).then(() => {
    return knex('harvestUseType').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((useType) => {
          return knex('harvestUseType').where({ harvest_use_type_id: useType.harvest_use_type_id }).update({
            harvest_use_type_translation_key: useType.harvest_use_type_name.replace(/\s/g, '_').toUpperCase(),
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('harvestUseType', (t) => {
    t.dropColumn('harvest_use_type_translation_key')
  })
};
