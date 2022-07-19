async function deleteSensorData(knex) {
  const sensorLocationIdObjs = await knex('sensor').select('location_id');
  const sensorLocationIds = sensorLocationIdObjs.map((s) => s.location_id);

  if (sensorLocationIds.length > 0) {
    const tasksWithSensorLocationsObjs = await knex.raw(
      `
            SELECT DISTINCT lt.task_id,
                            lt.location_id
            FROM location_tasks lt
                     JOIN task t on t.task_id = lt.task_id
            WHERE lt.location_id = ANY(?);
        `,
      [sensorLocationIds],
    );

    const tasksWithSensorLocations = tasksWithSensorLocationsObjs.rows.map((t) => t.task_id);
    await knex.transaction(async () => {
      await knex.raw(
        `
            DELETE FROM point p WHERE p.figure_id IN
            (SELECT f.figure_id FROM figure f WHERE f.type = 'sensor');
            DELETE FROM figure f WHERE f.type = 'sensor';
            DELETE FROM sensor_reading;
            DELETE FROM sensor_reading_type;
            DELETE FROM sensor;
          `,
      );
      await knex.raw(`DELETE FROM cleaning_task WHERE task_id = ANY(?);`, [
        tasksWithSensorLocations,
      ]);
      await knex.raw(`DELETE FROM maintenance_task WHERE task_id = ANY(?);`, [
        tasksWithSensorLocations,
      ]);
      await knex.raw(`DELETE FROM sale_task WHERE task_id = ANY(?);`, [tasksWithSensorLocations]);
      await knex.raw(`DELETE FROM social_task WHERE task_id = ANY(?);`, [tasksWithSensorLocations]);
      await knex.raw(`DELETE FROM sale_task WHERE task_id = ANY(?);`, [tasksWithSensorLocations]);
      await knex.raw(`DELETE FROM transplant_task WHERE task_id = ANY(?);`, [
        tasksWithSensorLocations,
      ]);
      await knex.raw(`DELETE FROM sale_task WHERE task_id = ANY(?);`, [tasksWithSensorLocations]);
      await knex.raw(`DELETE FROM transport_task WHERE task_id = ANY(?);`, [
        tasksWithSensorLocations,
      ]);
      await knex.raw(`DELETE FROM wash_and_pack_task WHERE task_id = ANY(?);`, [
        tasksWithSensorLocations,
      ]);
      await knex.raw(`DELETE FROM task WHERE task_id = ANY(?);`, [tasksWithSensorLocations]);
      await knex.raw(`DELETE FROM location WHERE location_id = ANY(?);`, [sensorLocationIds]);
      await knex.raw(
        `
                DROP TABLE sensor_reading;
                DROP TABLE sensor_reading_type;
                DROP TABLE sensor;
            `,
      );
    });
  } else {
    await knex.raw(
      `
          DROP TABLE sensor_reading;
          DROP TABLE sensor_reading_type;
          DROP TABLE sensor;
        `,
    );
  }
}

module.exports = deleteSensorData;
