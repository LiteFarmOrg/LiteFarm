exports.up = function(knex) {
  return knex('crop').whereNull('crop_translation_key')
    .then((data) => {
      return Promise.all(data.map((crop) => {
        return knex('crop').where({ crop_id: crop.crop_id }).update({
          crop_translation_key: crop.crop_common_name.replace(/[,()]/g, '').replace(/\s/g, '_').toUpperCase(),
        })
      }))
    })
};

exports.down = function(knex) {

};
