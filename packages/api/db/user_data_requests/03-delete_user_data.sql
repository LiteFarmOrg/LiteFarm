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

 -- @description: Manually delete all rows associated with a user (and their farms) inside a transaction.
- The syntax of this "comment" is intentionally incorrect, to prevent running this file as a script.

-- This SQL is never executed by LiteFarm app or server code.
-- It is intended for manual use by administrators to completely remove a user's data. It will delete ALL data associated with a user and their farm if they are the only user.

-- You should run this within a transaction and verify results before committing.


BEGIN TRANSACTION;

DO $$
DECLARE
    target_user_id VARCHAR := 'user_id_here';
    user_data        user_data_collections;
    farm_item        farm_data_collections;
    farm_count       INTEGER;

    task_tables          RECORD;
    task_prod_tables     RECORD;
    figure_tables        RECORD;
    location_tables      RECORD;
    pmp_tables           RECORD;
    management_plan_tables  RECORD;
    plan_repetition_tables  RECORD;
    animal_tables        RECORD;
    animal_batch_tables  RECORD;
    secondary_tables     RECORD;
    farm_tables          RECORD;
    created_by_tables    RECORD;
    user_tables          RECORD;

BEGIN

    user_data := get_user_data(target_user_id);

    FOREACH farm_item IN ARRAY user_data.farms LOOP
        -- prevent deletion of multi-user farms
        SELECT COUNT(*) INTO farm_count
            FROM "userFarm"
            WHERE farm_id = farm_item.farm_id;

            IF farm_count > 1 THEN
            RAISE EXCEPTION
                'Cannot delete: farm % has % users',
                farm_item.farm_id,
                farm_count;
            END IF;

        FOR task_prod_tables IN SELECT * FROM get_task_product_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE task_products_id = ANY($1)',
                task_prod_tables.table_name
            )
            USING farm_item.task_products_ids;
        END LOOP;

        FOR task_tables IN SELECT * FROM get_task_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE task_id = ANY($1)',
                task_tables.table_name
            )
            USING farm_item.task_ids;
        END LOOP;

        FOR pmp_tables IN SELECT * FROM get_pmp_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE planting_management_plan_id = ANY($1)',
            pmp_tables.table_name
        )
            USING farm_item.pmp_ids;
        END LOOP;

        FOR management_plan_tables IN SELECT * FROM get_management_plan_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE management_plan_id = ANY($1)',
            management_plan_tables.table_name
        )
            USING farm_item.management_plan_ids;
        END LOOP;

        FOR plan_repetition_tables IN SELECT * FROM get_mp_repetition_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE management_plan_group_id = ANY($1)',
            plan_repetition_tables.table_name
        )
            USING farm_item.management_plan_group_ids;
        END LOOP;

        FOR animal_tables IN SELECT * FROM get_animal_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE animal_id = ANY($1)',
            animal_tables.table_name
        )
            USING farm_item.animal_ids;
        END LOOP;

        FOR animal_batch_tables IN SELECT * FROM get_animal_batch_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE animal_batch_id = ANY($1)',
            animal_batch_tables.table_name
        )
            USING farm_item.animal_batch_ids;
        END LOOP;

        FOR figure_tables IN SELECT * FROM get_figure_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE figure_id = ANY($1)',
                figure_tables.table_name
            )
            USING farm_item.figure_ids;
        END LOOP;

        -- locations
        -- First NULL problematic circular reference between farm and location
        UPDATE "farm"
            SET default_initial_location_id = NULL
        WHERE farm_id = farm_item.farm_id;

        FOR location_tables IN SELECT * FROM get_location_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE location_id = ANY($1)',
                location_tables.table_name
                )
            USING farm_item.location_ids;
        END LOOP;

        -- tables requiring join to a second table with farm_id
        FOR secondary_tables IN SELECT * FROM get_secondary_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I AS c USING %I AS p WHERE p.farm_id = $1 AND c.%I = p.%I',
                secondary_tables.child_table,
                secondary_tables.join_table,
                secondary_tables.join_key,
                secondary_tables.join_key
            )
            USING farm_item.farm_id;
        END LOOP;

        -- remaining farm-scoped data
        FOR farm_tables IN SELECT * FROM get_farm_scoped_tables() LOOP
            EXECUTE format(
                'DELETE FROM %I WHERE farm_id = $1',
                farm_tables.table_name
                )
            USING farm_item.farm_id;
        END LOOP;

    END LOOP;

    -- user data not specific to farm
    FOR created_by_tables IN SELECT * FROM get_created_by_user_tables() LOOP
        EXECUTE format(
            'DELETE FROM %I WHERE created_by_user_id = $1',
            created_by_tables.table_name
            )
        USING target_user_id;
    END LOOP;

    FOR user_tables IN SELECT * FROM get_user_scoped_tables() LOOP
        EXECUTE format(
            'DELETE FROM %I WHERE user_id = $1',
            user_tables.table_name
            )
        USING target_user_id;
    END LOOP;

    RAISE NOTICE 'Data deletion complete for user_id: %', target_user_id;
END $$;

-- COMMIT