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

-- @description: Return new JSONB = base + (key→payload) if payload IS NOT NULL. A helper function to build the export data object
CREATE OR REPLACE FUNCTION jsonb_merge(
  base    JSONB,
  key     TEXT,
  payload JSONB
) RETURNS JSONB
  LANGUAGE sql AS $$
    SELECT CASE
      WHEN payload IS NULL THEN base
      ELSE base || jsonb_build_object(key, payload)
    END;
$$;

-- @description: Build a JSONB payload containing every user- and farm-scoped record for export
CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    target_user_id            VARCHAR := 'user_id_here';
    user_data                 user_data_collections;
    farm_item                 farm_data_collections;
    farm_count                INTEGER;

    task_tables               RECORD;
    task_prod_tables          RECORD;
    pmp_tables                RECORD;
    mp_tables                 RECORD;
    plan_repetition_tables    RECORD;
    figure_tables             RECORD;
    animal_tables             RECORD;
    animal_batch_tables       RECORD;
    location_tables           RECORD;
    secondary_tables          RECORD;
    farm_tables               RECORD;
    created_by_tables         RECORD;
    user_tables               RECORD;

    farm_json                 JSONB;
    table_data                JSONB;
    full_export               JSONB := '{}'::jsonb;
BEGIN
    user_data := get_user_data(target_user_id);

    FOREACH farm_item IN ARRAY user_data.farms LOOP
        farm_json := '{}'::jsonb;

          -- ==== 1) TASK PRODUCT-SCOPED TABLE ====
          FOR task_prod_tables IN SELECT * FROM get_task_product_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(t)) FROM %I t WHERE t.task_products_id = ANY($1)',
              task_prod_tables.table_name
            )
            INTO table_data
            USING farm_item.task_products_ids;

            farm_json := jsonb_merge(farm_json, task_prod_tables.table_name, table_data);
          END LOOP;

          -- ==== 2) TASK‐SCOPED TABLES ====
          FOR task_tables IN SELECT * FROM get_task_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(t)) FROM %I t WHERE t.task_id = ANY($1)',
              task_tables.table_name
            )
            INTO table_data
            USING farm_item.task_ids;

            farm_json := jsonb_merge(farm_json, task_tables.table_name, table_data);
          END LOOP;

          -- ==== 3) CROP PLAN TABLES ====
          FOR pmp_tables IN SELECT * FROM get_pmp_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(p)) FROM %I p ' ||
              'WHERE p.planting_management_plan_id = ANY($1)',
              pmp_tables.table_name
            )
            INTO table_data
            USING farm_item.pmp_ids;

            farm_json := jsonb_merge(farm_json, pmp_tables.table_name, table_data);
          END LOOP;

          FOR mp_tables IN SELECT * FROM get_management_plan_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(m)) FROM %I m ' ||
              'WHERE m.management_plan_id = ANY($1)',
              mp_tables.table_name
            )
            INTO table_data
            USING farm_item.management_plan_ids;

            farm_json := jsonb_merge(farm_json, mp_tables.table_name, table_data);
          END LOOP;

          FOR plan_repetition_tables IN SELECT * FROM get_mp_repetition_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(r)) FROM %I r ' ||
              'WHERE r.management_plan_group_id = ANY($1)',
              plan_repetition_tables.table_name
            )
            INTO table_data
            USING farm_item.management_plan_group_ids;

            farm_json := jsonb_merge(farm_json, plan_repetition_tables.table_name, table_data);
          END LOOP;

          -- ==== 3) ANIMALS ====
          FOR animal_tables IN SELECT * FROM get_animal_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(a)) FROM %I a ' ||
              'WHERE a.animal_id = ANY($1)',
              animal_tables.table_name
            )
            INTO table_data
            USING farm_item.animal_ids;

            farm_json := jsonb_merge(farm_json, animal_tables.table_name, table_data);
          END LOOP;

          FOR animal_batch_tables IN
            SELECT * FROM get_animal_batch_tables()
          LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(ab)) FROM %I ab ' ||
              'WHERE ab.animal_batch_id = ANY($1)',
              animal_batch_tables.table_name
            )
            INTO table_data
            USING farm_item.animal_batch_ids;

            farm_json := jsonb_merge(farm_json, animal_batch_tables.table_name, table_data);
          END LOOP;

          -- ==== 3) LOCATIONS ====
          FOR figure_tables IN SELECT * FROM get_figure_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(f)) FROM %I f ' ||
              'WHERE f.figure_id = ANY($1)',
              figure_tables.table_name
            )
            INTO table_data
            USING farm_item.figure_ids;

            farm_json := jsonb_merge(farm_json, figure_tables.table_name, table_data);
          END LOOP;

          FOR location_tables IN SELECT * FROM get_location_export_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(l)) FROM %I l ' ||
              'WHERE l.location_id = ANY($1)',
              location_tables.table_name
            )
            INTO table_data
            USING farm_item.location_ids;

            farm_json := jsonb_merge(farm_json, location_tables.table_name, table_data);
          END LOOP;

          -- ==== TABLES REQUIRING SECONDARY JOIN FOR FARM_ID ====
          FOR secondary_tables IN SELECT * FROM get_secondary_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(c)) ' ||
              'FROM %I c JOIN %I p ON c.%I = p.%I ' ||
              'WHERE p.farm_id = $1',
              secondary_tables.child_table,
              secondary_tables.join_table,
              secondary_tables.join_key,
              secondary_tables.join_key
            )
            INTO table_data
            USING farm_item.farm_id;

            farm_json := jsonb_merge(farm_json, secondary_tables.child_table, table_data);
          END LOOP;

          -- ==== REMAINING FARM-SCOPED TABLES  ====
          FOR farm_tables IN SELECT * FROM get_farm_export_tables() LOOP
            EXECUTE format(
              'SELECT json_agg(to_jsonb(fm)) ' ||
              'FROM %I fm WHERE fm.farm_id = $1',
              farm_tables.table_name
            )
            INTO table_data
            USING farm_item.farm_id;

            farm_json := jsonb_merge(farm_json, farm_tables.table_name, table_data);
          END LOOP;

      -- append this farm into the "farms" array
      full_export := jsonb_merge(
        full_export,
        'farms', 
        COALESCE(full_export->'farms','[]'::jsonb) || farm_json
      );

    END LOOP;

    -- ==== USER DATA NOT SPECIFIC TO FARM ====
    FOR created_by_tables IN
        SELECT * FROM get_created_by_user_tables()
    LOOP
        EXECUTE format(
          'SELECT json_agg(to_jsonb(cb)) ' ||
          'FROM %I cb WHERE cb.created_by_user_id = $1',
          created_by_tables.table_name
        )
        INTO table_data
        USING target_user_id;

        full_export := jsonb_merge(full_export, created_by_tables.table_name, table_data);
    END LOOP;

    FOR user_tables IN
        SELECT * FROM get_user_scoped_tables()
    LOOP
        EXECUTE format(
          'SELECT json_agg(to_jsonb(u)) ' ||
          'FROM %I u WHERE u.user_id = $1',
          user_tables.table_name
        )
        INTO table_data
        USING target_user_id;

        full_export := jsonb_merge(full_export, user_tables.table_name, table_data);
    END LOOP;

    -- Format export object
    RETURN jsonb_build_object(
      'user_id',       target_user_id,
      'exported_at',   to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'export_type',   'all_user_data',
      'data',          full_export
    );

END $$;

SELECT export_user_data() as export;