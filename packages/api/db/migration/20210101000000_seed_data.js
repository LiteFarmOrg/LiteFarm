const { seed } = require('../seeds/put_all_datasets');

// LF databases that are sufficiently old were manually seeded before running 2021 and later migrations.
// This back-dated migration was created to achieve the same effect for databases created later.
// `up()` checks existence of table `fertilizerLog`; its presence suggests the database needs seeding.

exports.up = async function (knex) {
  if (await knex.schema.hasTable('fertilizerLog')) await seed(knex);
};

exports.down = function () {
  throw new Error('Function down() is not defined for the seed_data migration');
};
