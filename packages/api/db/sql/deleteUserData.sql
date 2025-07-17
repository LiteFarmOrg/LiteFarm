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


-- This SQL is never executed by LiteFarm app or server code.
-- It is intended for manual use by administrators to completely remove a user's data.
-- It will delete ALL data associated with a user and their farm if they are the only user.
- The syntax of this "comment" is intentionally incorrect, to prevent running this file as a script.
-- You should run this within a transaction and verify results before committing.
-- USE WITH EXTREME CAUTION - THIS PERMANENTLY DELETES DATA

-- For safety, start a transaction. Before COMMIT; the changes will be visible to this session only.
-- At any prior time, use ROLLBACK; to discard transaction changes.
BEGIN TRANSACTION;

-- Set the user_id to delete
DO $$
DECLARE
    target_user_id VARCHAR := 'user_id_here'; -- REPLACE WITH ACTUAL USER ID
    target_farm_id UUID;
    location_ids UUID[];
BEGIN
    -- Get the farm_id associated with this user
    SELECT farm_id INTO target_farm_id 
    FROM "userFarm"
    WHERE user_id = target_user_id
    LIMIT 1;

    -- Early check if farm exists for this user
    IF target_farm_id IS NULL THEN
        RAISE NOTICE 'No farm found for user_id: %. Will only delete user data.', target_user_id;
    ELSE
        RAISE NOTICE 'Deleting data for farm_id: %', target_farm_id;
        
        -- Check if this is the only user on the farm (to confirm full farm deletion is appropriate)
        IF (SELECT COUNT(*) FROM "userFarm" WHERE farm_id = target_farm_id) > 1 THEN
            RAISE EXCEPTION 'Multiple users found on farm_id: %. This script is intended only for single-user farms. Aborting.', target_farm_id;
        END IF;

        -- Get all location_ids associated with this farm
        SELECT array_agg(location_id) INTO location_ids
        FROM "location"
        WHERE farm_id = target_farm_id;

        -- Delete animal related data
        DELETE FROM "animal_batch_group_relationship" WHERE animal_batch_id IN (
            SELECT id FROM "animal_batch" WHERE farm_id = target_farm_id
        );
        DELETE FROM "animal_group_relationship" WHERE animal_id IN (
            SELECT id FROM "animal" WHERE farm_id = target_farm_id
        );
        DELETE FROM "animal_batch" WHERE farm_id = target_farm_id;
        DELETE FROM "animal" WHERE farm_id = target_farm_id;
        DELETE FROM "custom_animal_breed" WHERE farm_id = target_farm_id;
        DELETE FROM "custom_animal_type" WHERE farm_id = target_farm_id;
    
        -- Delete task-related data (not nullifying references since we're deleting entire farm)
        DELETE FROM "location_tasks" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "field_work_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "harvest_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "harvest_use" WHERE harvest_task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id AND type = 'harvest'
        );
        DELETE FROM "irrigation_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "scouting_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "pest_control_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "soil_amendment_task" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "soil_amendment_task_products" WHERE task_id IN (
            SELECT task_id FROM "task" WHERE farm_id = target_farm_id
        );
        DELETE FROM "task" WHERE farm_id = target_farm_id;

        -- Delete nomination data
        DELETE FROM "nomination_crop" WHERE nomination_id IN (
            SELECT nomination_id FROM "nomination" WHERE farm_id = target_farm_id
        );
        DELETE FROM "nomination_status" WHERE nomination_id IN (
            SELECT nomination_id FROM "nomination" WHERE farm_id = target_farm_id
        );
        DELETE FROM "nomination" WHERE farm_id = target_farm_id;

        -- Delete planting management plans and related tables
        DELETE FROM "management_tasks" WHERE planting_management_plan_id IN (
            SELECT pmp.planting_management_plan_id 
            FROM "planting_management_plan" pmp
            JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
            JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
            WHERE cv.farm_id = target_farm_id
        );
        DELETE FROM "container_method" WHERE planting_management_plan_id IN (
            SELECT pmp.planting_management_plan_id 
            FROM "planting_management_plan" pmp
            JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
            JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
            WHERE cv.farm_id = target_farm_id
        );
        DELETE FROM "broadcast_method" WHERE planting_management_plan_id IN (
            SELECT pmp.planting_management_plan_id 
            FROM "planting_management_plan" pmp
            JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
            JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
            WHERE cv.farm_id = target_farm_id
        );
        DELETE FROM "bed_method" WHERE planting_management_plan_id IN (
            SELECT pmp.planting_management_plan_id 
            FROM "planting_management_plan" pmp
            JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
            JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
            WHERE cv.farm_id = target_farm_id
        );
        DELETE FROM "row_method" WHERE planting_management_plan_id IN (
            SELECT pmp.planting_management_plan_id 
            FROM "planting_management_plan" pmp
            JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
            JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
            WHERE cv.farm_id = target_farm_id
        );
        DELETE FROM "planting_management_plan" WHERE management_plan_id IN (
            SELECT management_plan_id FROM "management_plan"
            WHERE crop_variety_id IN (
                SELECT crop_variety_id FROM "crop_variety" WHERE farm_id = target_farm_id
            )
        );
        
        -- Delete farm crops, crop varieties, management plans, and related data
        DELETE FROM "management_plan_group" WHERE management_plan_id IN (
            SELECT management_plan_id FROM "management_plan" 
            WHERE crop_variety_id IN (
                SELECT crop_variety_id FROM "crop_variety" WHERE farm_id = target_farm_id
            )
        );
        DELETE FROM "management_plan" WHERE crop_variety_id IN (
            SELECT crop_variety_id FROM "crop_variety" WHERE farm_id = target_farm_id
        );
        DELETE FROM "crop_variety" WHERE farm_id = target_farm_id;
        DELETE FROM "crop" WHERE farm_id = target_farm_id;

        -- Delete location data
        -- UNNEST converts array to rows for use in IN clauses
        IF location_ids IS NOT NULL AND array_length(location_ids, 1) > 0 THEN
            DELETE FROM "figure" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "field" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "garden" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "gate" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "water_valve" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "buffer_zone" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "watercourse" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "fence" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "barn" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "natural_area" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "surface_water" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "organic_history" WHERE location_id IN (SELECT UNNEST(location_ids));
            DELETE FROM "location" WHERE farm_id = target_farm_id;
        END IF;
        
        -- Delete farm site boundary (handled separately as it's not part of the location table)
        DELETE FROM "farm_site_boundary" WHERE farm_id = target_farm_id;
        
        -- Delete farm integrations
        DELETE FROM "farm_addon" WHERE farm_id = target_farm_id;
        
        -- Delete farm documents (note: this only deletes database references, not the actual files)
        DELETE FROM "document" WHERE farm_id = target_farm_id;
        
        -- Delete financial data
        DELETE FROM "sale" WHERE farm_id = target_farm_id;
        DELETE FROM "expense" WHERE farm_id = target_farm_id;
        DELETE FROM "farmExpenseType" WHERE farm_id = target_farm_id;
        DELETE FROM "revenue_type" WHERE farm_id = target_farm_id;
        
        -- Delete legacy tables (not likely to be populated)
        DELETE FROM "shiftTask" WHERE shift_id IN (
            SELECT shift_id FROM "shift" WHERE farm_id = target_farm_id
        );
        DELETE FROM "shift" WHERE farm_id = target_farm_id;
        DELETE FROM "price" WHERE farm_id = target_farm_id;
        DELETE FROM "yield" WHERE farm_id = target_farm_id;
        
        -- Delete certifier survey
        DELETE FROM "organicCertifierSurvey" WHERE farm_id = target_farm_id;
        
        -- Delete any custom data
        DELETE FROM "taskType" WHERE farm_id = target_farm_id;
        DELETE FROM "fertilizer" WHERE farm_id = target_farm_id;
        DELETE FROM "pesticide" WHERE farm_id = target_farm_id;
        DELETE FROM "userLog" WHERE farm_id = target_farm_id;
        DELETE FROM "notification" WHERE farm_id = target_farm_id;
        DELETE FROM "weather_station" WHERE farm_id = target_farm_id;

        
        -- Delete userFarm relationships
        DELETE FROM "userFarm" WHERE farm_id = target_farm_id;
        
        -- Finally delete the farm
        DELETE FROM "farm" WHERE farm_id = target_farm_id;
    END IF;

    -- Clean up user data not dependent on farm
    DELETE FROM "userLog" WHERE user_id = target_user_id;
    DELETE FROM "showedSpotlight" WHERE user_id = target_user_id;
    DELETE FROM "emailToken" WHERE user_id = target_user_id;
    DELETE FROM "password" WHERE user_id = target_user_id;
    DELETE FROM "release_badge" WHERE user_id = target_user_id;
    DELETE FROM "notification_user" WHERE user_id = target_user_id;
    DELETE FROM "supportTicket" WHERE created_by_user_id = target_user_id;
    
    -- Finally, delete the user
    DELETE FROM "users" WHERE user_id = target_user_id;

    RAISE NOTICE 'Data deletion complete for user_id: %', target_user_id;
END $$;

-- Last chance to ROLLBACK; This will finalize changes. Remove comment to execute.
-- COMMIT;