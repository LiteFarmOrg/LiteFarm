exports.up = async function(knex) {
  const deletedLocations = await knex('location').where({ deleted: true });
  await knex('location_tasks').whereIn('location_id', deletedLocations.map(({ location_id }) => location_id)).delete();
};

exports.down = function(knex) {

};
