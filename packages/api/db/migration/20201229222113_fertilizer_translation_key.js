exports.up = function (knex) {
  return knex.schema.alterTable('fertilizer', (t) => {
    t.string('fertilizer_translation_key')
  }).then(() => {
    return knex('fertilizer').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((fertilizer) => {
          return knex('fertilizer').where({ fertilizer_id: fertilizer.fertilizer_id }).update({
            fertilizer_translation_key: fertilizer.fertilizer_type.replace(/[,()]/g, '').replace(/\s/g, '_').toUpperCase(),
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('fertilizer', (t) => {
    t.dropColumn('fertilizer_translation_key')
  })
};
