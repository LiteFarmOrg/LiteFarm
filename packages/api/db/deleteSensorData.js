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
            WHERE lt.location_id = ANY(?)
            UNION
            SELECT DISTINCT mt.task_id, pmp.location_id
            FROM management_tasks mt
                     JOIN task t on t.task_id = mt.task_id
                     JOIN planting_management_plan pmp on pmp.planting_management_plan_id = mt.planting_management_plan_id
            WHERE pmp.location_id = ANY(?)
            UNION
            SELECT DISTINCT pt.task_id, pmp.location_id
            from plant_task pt
                     JOIN task t on t.task_id = pt.task_id
                     JOIN planting_management_plan pmp on pt.planting_management_plan_id = pmp.planting_management_plan_id
            WHERE pmp.location_id = ANY(?)
            UNION
            SELECT DISTINCT tt.task_id, pmp.location_id
            from transplant_task tt
                     JOIN task t on t.task_id = tt.task_id
                     JOIN planting_management_plan pmp on tt.planting_management_plan_id = pmp.planting_management_plan_id
            WHERE pmp.location_id = :ANY(?);
        `,
      [sensorLocationIds],
    );
    const tasksWithSensorLocations = tasksWithSensorLocationsObjs.map((t) => t.task_id);

    const plansWithSensorLocationsObjs = knex.raw(
      `
          SELECT DISTINCT management_plan_id FROM planting_management_plan WHERE location_id = ANY(?);
        `,
      [sensorLocationIdObjs],
    );
    const plansWithSensorLocations = plansWithSensorLocationsObjs.map((p) => p.management_plan_id);

    await knex.raw(
      `
          BEGIN TRANSACTION;
          DELETE FROM point p WHERE p.figure_id IN
          (SELECT f.figure_id FROM figure f WHERE f.type = 'sensor');
          DELETE FROM figure f WHERE f.type = 'sensor';
          DELETE FROM sensor_reading;
          DELETE FROM sensor_reading_type;
          DELETE FROM sensor;
          UPDATE management_plan SET deleted = TRUE WHERE management_plan_id = ANY(:plansWithSensorLocations);
          DELETE FROM task WHERE task_id = ANY(:tasksWithSensorLocations);
          DELETE FROM location WHERE location_id = ANY(:sensorLocationIds);
          DROP TABLE sensor_reading;
          DROP TABLE sensor_reading_type;
          DROP TABLE sensor;
          COMMIT;
        `,
      {
        plansWithSensorLocations,
        tasksWithSensorLocations,
        sensorLocationIds,
      },
    );
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
