exports.up = async function (knex) {
  await deleteSensorData(knex);
};

exports.down = async function (knex) {
  await deleteSensorData(knex);
};

async function deleteSensorData(knex) {
  const sensorLocationIdObjs = await knex('sensor').select('location_id');
  const sensorLocationIds = sensorLocationIdObjs.map((s) => s.location_id);

  if (sensorLocationIds.length > 0) {
    await knex.raw(`
              BEGIN TRANSACTION;
              DELETE FROM point p WHERE p.figure_id IN
              (SELECT f.figure_id FROM figure f WHERE f.type = 'sensor');
              DELETE FROM figure f WHERE f.type = 'sensor';
              DELETE FROM sensor_reading;
              DELETE FROM sensor_reading_type;
              DELETE FROM sensor;
              COMMIT;
          `);

    await knex('location').whereIn('location_id', sensorLocationIds).del();
  }
  await knex.raw(`
    DROP TABLE sensor_reading;
    DROP TABLE sensor_reading_type;
    DROP TABLE sensor;
  `);
}
