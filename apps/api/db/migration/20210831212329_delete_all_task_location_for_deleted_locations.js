export const up = async function (knex) {
  const deletedLocations = await knex('location').where({ deleted: true });
  await knex('location_tasks')
    .whereIn(
      'location_id',
      deletedLocations.map(({ location_id }) => location_id),
    )
    .delete();
};

// eslint-disable-next-line no-unused-vars
export const down = function (knex) {};
