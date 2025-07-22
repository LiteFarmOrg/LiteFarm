/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
DROP FUNCTION IF EXISTS get_user_data(VARCHAR);
DROP TYPE IF EXISTS user_data_collections;
DROP TYPE IF EXISTS farm_data_collections;

CREATE TYPE farm_data_collections AS (
  farm_id             UUID,
  task_ids            INTEGER[],
  task_products_ids   INTEGER[],
  location_ids        UUID[],
  figure_ids          UUID[],
  animal_ids          INTEGER[],
  animal_batch_ids    INTEGER[],
  management_plan_ids INTEGER[],
  pmp_ids             UUID[],
  management_plan_group_ids UUID[]
);

CREATE TYPE user_data_collections AS (
  user_farm_ids       UUID[],
  farms               farm_data_collections[]
);


-- @description: Gather per-farm arrays of IDs (tasks, locations, animals, etc.) for a given user.
CREATE OR REPLACE FUNCTION get_user_data(p_user_id VARCHAR)
  RETURNS user_data_collections
  LANGUAGE plpgsql
AS $$
DECLARE
  result    user_data_collections;
  farm_record  RECORD;
  farm_data farm_data_collections;
BEGIN

  SELECT 
    COALESCE(array_agg(farm_id), ARRAY[]::UUID[])
    INTO result.user_farm_ids
    FROM "userFarm"
    WHERE user_id = p_user_id;

  result.farms := ARRAY[]::farm_data_collections[];

  FOR farm_record IN
    SELECT unnest(result.user_farm_ids) AS farm_id
  LOOP
    farm_data.farm_id := farm_record.farm_id;
    
    -- crop-plan related IDs
    SELECT 
        COALESCE(array_agg(mp.management_plan_id), ARRAY[]::INTEGER[])
    INTO farm_data.management_plan_ids
    FROM "management_plan" mp
    JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
    WHERE cv.farm_id = farm_data.farm_id;

    SELECT 
        COALESCE(array_agg(pmp.planting_management_plan_id), ARRAY[]::UUID[])
      INTO farm_data.pmp_ids
    FROM "planting_management_plan" pmp
    WHERE pmp.management_plan_id = ANY(farm_data.management_plan_ids);

    SELECT
      COALESCE(array_agg(DISTINCT mp.management_plan_group_id), ARRAY[]::UUID[])
    INTO farm_data.management_plan_group_ids
    FROM management_plan mp
    WHERE mp.management_plan_id = ANY(farm_data.management_plan_ids)
      AND mp.management_plan_group_id IS NOT NULL;

    -- task IDs
    SELECT 
        COALESCE(array_agg(DISTINCT id), ARRAY[]::INTEGER[])
    INTO farm_data.task_ids
    FROM (
        -- via task_type (custom tasks)
        SELECT t.task_id           AS id
        FROM "task" t
        JOIN "task_type" tt ON t.task_type_id = tt.task_type_id
        AND tt.farm_id = farm_record.farm_id

        UNION

        -- via location_tasks
        SELECT lt.task_id          AS id
        FROM "location_tasks" lt
        JOIN "location" l ON lt.location_id = l.location_id
        AND l.farm_id = farm_record.farm_id

        UNION

        -- via management_tasks + planting_manangement_plans
        SELECT mt.task_id          AS id
        FROM "management_tasks" mt
        WHERE mt.planting_management_plan_id = ANY(farm_data.pmp_ids)

        UNION

        -- via transplant_task
        SELECT tt.task_id          AS id
        FROM transplant_task tt
        WHERE tt.planting_management_plan_id = ANY(farm_data.pmp_ids)
         OR tt.prev_planting_management_plan_id = ANY(farm_data.pmp_ids)

        UNION

        -- via planting management plan ids (plant tasks)
        SELECT pt.task_id
          FROM plant_task pt
          WHERE pt.planting_management_plan_id = ANY(farm_data.pmp_ids)

        UNION

        -- via task_animal_relationship
        SELECT tar.task_id         AS id
        FROM "task_animal_relationship" tar
        JOIN "animal" a ON tar.animal_id = a.id
        AND a.farm_id = farm_record.farm_id

        UNION

        -- via task_animal_batch_relationship
        SELECT tabr.task_id        AS id
        FROM "task_animal_batch_relationship" tabr
        JOIN "animal_batch" ab ON tabr.animal_batch_id = ab.id
        AND ab.farm_id = farm_record.farm_id
    ) AS farm_tasks;

    -- soil amendment task products (needed for the purpose relationship table)
    SELECT
      COALESCE(array_agg(id), ARRAY[]::INTEGER[])
    INTO farm_data.task_products_ids
    FROM soil_amendment_task_products
    WHERE task_id = ANY(farm_data.task_ids);

    -- locations
    SELECT 
        COALESCE(array_agg(location_id), ARRAY[]::UUID[])
    INTO farm_data.location_ids
    FROM "location"
    WHERE farm_id = farm_data.farm_id;

    -- figures
    SELECT 
        COALESCE(array_agg(figure_id), ARRAY[]::UUID[])
    INTO farm_data.figure_ids
    FROM "figure"
    WHERE location_id = ANY(farm_data.location_ids);

    -- animals & batches
    SELECT 
        COALESCE(array_agg(id), ARRAY[]::INTEGER[])
    INTO farm_data.animal_ids
    FROM "animal"
    WHERE farm_id = farm_data.farm_id;

    SELECT 
        COALESCE(array_agg(id), ARRAY[]::INTEGER[])
    INTO farm_data.animal_batch_ids
    FROM "animal_batch"
    WHERE farm_id = farm_data.farm_id;

    -- append this farm’s results
    result.farms := array_append(result.farms, farm_data);
  END LOOP;

  RETURN result;
END;
$$;