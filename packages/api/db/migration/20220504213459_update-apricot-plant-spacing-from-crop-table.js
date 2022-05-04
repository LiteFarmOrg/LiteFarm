
const tableName = "crop";
const apricot_id = 31; // Apricot
const apricot_plant_spacing = 457.2; // in cm

exports.up = async function(knex) {
  await knex(tableName)
    .where({ crop_id: apricot_id })
    .update({ plant_spacing: apricot_plant_spacing });
};

exports.down = async function(knex) {
  await knex(tableName)
    .where({ crop_id: apricot_id })
    .update({ plant_spacing: 15 });
};
