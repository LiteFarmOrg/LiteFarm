exports.up = function (knex) {
  return knex.schema.table('sensor', (table) => {
    table.string('model');
    table.string('part_number');
    table.string('hardware_version');
  });
};

exports.down = function (knex) {
  return knex.schema.table('sensor', (table) => {
    table.dropColumn('model');
    table.dropColumn('part_number');
    table.dropColumn('hardware_version');
  });
};
