const mapTimeZoneOffsetsToFarms = require('../../src/jobs/station_sync/updateTimeZoneOffsets');
exports.up = async function (knex) {
  await mapTimeZoneOffsetsToFarms(knex);
};

exports.down = async function (knex) {
  await knex('farm').update('utc_offset', null);
};
