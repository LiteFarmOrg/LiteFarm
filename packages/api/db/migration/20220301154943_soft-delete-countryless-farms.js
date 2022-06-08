exports.up = function (knex) {
  return knex.schema.raw(`
    UPDATE farm
    SET deleted = true
    WHERE country_id IS NULL
      AND grid_points IS NULL;
 `);
};

exports.down = function (knex) {
  return knex.schema.raw(`
    UPDATE farm
    SET deleted = false 
    WHERE country_id IS NULL
      AND grid_points IS NULL;
 `);
};
