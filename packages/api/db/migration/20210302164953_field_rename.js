
exports.up = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE field RENAME COLUMN field_id TO location_id'),
    knex.raw('ALTER TABLE "fieldCrop" RENAME COLUMN field_id TO location_id'),
    knex.raw('ALTER TABLE "activityFields" RENAME COLUMN field_id TO location_id'),
    knex.raw('ALTER TABLE "shiftTask" RENAME COLUMN field_id TO location_id'),
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.raw('ALTER TABLE field RENAME COLUMN location_id TO field_id'),
    knex.raw('ALTER TABLE "fieldCrop" RENAME COLUMN  location_id TO field_id'),
    knex.raw('ALTER TABLE "activityFields" RENAME COLUMN  location_id TO field_id'),
    knex.raw('ALTER TABLE "shiftTask" RENAME COLUMN  location_id TO field_id'),
  ]);

};
