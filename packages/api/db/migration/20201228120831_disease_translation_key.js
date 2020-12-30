exports.up = function (knex) {
  return knex.schema.alterTable('disease', (t) => {
    t.string('disease_name_translation_key')
    t.string('disease_group_translation_key')
  }).then(() => {
    return knex('disease').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((disease) => {
          return knex('disease').where({ disease_id: disease.disease_id }).update({
            disease_name_translation_key: disease.disease_common_name.replace(/\s/g, '_').toUpperCase(),
            disease_group_translation_key: disease.disease_group.toUpperCase(),
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('disease', (t) => {
    t.dropColumn('disease_name_translation_key')
    t.dropColumn('disease_group_translation_key')
  })
};
