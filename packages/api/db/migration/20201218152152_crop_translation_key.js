exports.up = function (knex) {
  return knex.schema.alterTable('crop', (t) => {
    t.string('crop_translation_key')
  }).then(() => {
    return knex('crop').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((crop) => {
          return knex('crop').where({ crop_id: crop.crop_id }).update({
            crop_translation_key: crop.crop_common_name.replace(/[,()]/g, '').replace(/\s/g, '_').toUpperCase(),
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('crop', (t) => {
    t.dropColumn('crop_translation_key')
  })
};
