exports.up = function (knex) {
  return Promise.all([
    knex('harvestUseType').where({ harvest_use_type_id: 9, harvest_use_type_name: 'Other', farm_id: null }).del(),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex('harvestUseType').insert([
      { harvest_use_type_id: 9, harvest_use_type_name: 'Other', farm_id: null },
    ]),
  ]);
};
  