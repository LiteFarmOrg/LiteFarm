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
    figure_ids UUID[];
    task_ids INTEGER[];
    management_plan_group_ids UUID[];
    farm_record RECORD;
    farm_count INTEGER;
    multi_user_farms TEXT := '';
    has_multi_user_farm BOOLEAN := FALSE;
BEGIN
    -- Count how many farms this user has
    SELECT COUNT(*) INTO farm_count 
    FROM "userFarm"
    WHERE user_id = target_user_id;

    -- Early check if user has any farms
    IF farm_count = 0 THEN
        RAISE NOTICE 'No farms found for user_id: %. Will only delete user data.', target_user_id;
    ELSE
        -- Check if any farms have multiple users and collect their IDs
        FOR farm_record IN 
            SELECT uf.farm_id, f.farm_name,
                   (SELECT COUNT(*) FROM "userFarm" WHERE farm_id = uf.farm_id) as user_count
            FROM "userFarm" uf
            JOIN "farm" f ON uf.farm_id = f.farm_id
            WHERE uf.user_id = target_user_id
        LOOP
            IF farm_record.user_count > 1 THEN
                has_multi_user_farm := TRUE;
                multi_user_farms := multi_user_farms || farm_record.farm_id || ', ';
            END IF;
        END LOOP;
        
        -- If any farm has multiple users, abort the entire operation
        IF has_multi_user_farm THEN
            RAISE EXCEPTION 'User belongs to farms with multiple users: %. This script only handles users who are sole owners of their farms. Aborting.', rtrim(multi_user_farms, ', ');
        END IF;
        
        -- Process each farm (now we know they're all single-user farms)
        FOR farm_record IN 
            SELECT uf.farm_id
            FROM "userFarm" uf
            WHERE uf.user_id = target_user_id
        LOOP
            target_farm_id := farm_record.farm_id;
            RAISE NOTICE 'Deleting data for farm_id: %', target_farm_id;

            -- Get all task_ids associated with this far
            WITH farm_tasks AS (
                -- Tasks associated via task_type
                SELECT t.task_id
                FROM "task" t
                JOIN "task_type" tt ON t.task_type_id = tt.task_type_id
                WHERE tt.farm_id = target_farm_id
                
                UNION
                
                -- Tasks associated via locations
                SELECT lt.task_id
                FROM "location_tasks" lt
                JOIN "location" l ON lt.location_id = l.location_id
                WHERE l.farm_id = target_farm_id
                
                UNION
                
                -- Tasks associated via management plans and crop varieties
                SELECT mt.task_id
                FROM "management_tasks" mt
                JOIN "planting_management_plan" pmp ON mt.planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = target_farm_id
                
                UNION

                -- Tasks associated via transplant_task's planting_management_plan references
                SELECT tt.task_id
                FROM "transplant_task" tt
                JOIN "planting_management_plan" pmp ON tt.planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = target_farm_id

                UNION

                -- Tasks associated via transplant_task's prev_planting_management_plan references
                SELECT tt.task_id
                FROM "transplant_task" tt
                JOIN "planting_management_plan" pmp ON tt.prev_planting_management_plan_id = pmp.planting_management_plan_id
                JOIN "management_plan" mp ON pmp.management_plan_id = mp.management_plan_id
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = target_farm_id

                UNION
                
                -- Tasks associated with animals
                SELECT tar.task_id
                FROM "task_animal_relationship" tar
                JOIN "animal" a ON tar.animal_id = a.id
                WHERE a.farm_id = target_farm_id
                
                UNION
                
                -- Tasks associated with animal batches
                SELECT tabr.task_id
                FROM "task_animal_batch_relationship" tabr
                JOIN "animal_batch" ab ON tabr.animal_batch_id = ab.id
                WHERE ab.farm_id = target_farm_id
            )
            SELECT array_agg(task_id) INTO task_ids FROM farm_tasks;

            IF task_ids IS NOT NULL THEN

                DELETE FROM "location_tasks" WHERE task_id = ANY(task_ids);
                DELETE FROM "task_document" WHERE task_id = ANY(task_ids);

                -- Delete animal tasks and their relationships
                DELETE FROM "animal_movement_task_purpose_relationship" WHERE task_id = ANY(task_ids);
                DELETE FROM "task_animal_relationship" WHERE task_id = ANY(task_ids);
                DELETE FROM "task_animal_batch_relationship" WHERE task_id = ANY(task_ids);

                -- Delete task products and their relationships
                DELETE FROM "soil_amendment_task_products_purpose_relationship" WHERE task_products_id IN (
                    SELECT id FROM "soil_amendment_task_products" WHERE task_id = ANY(task_ids));
                DELETE FROM "soil_amendment_task_products" WHERE task_id = ANY(task_ids);

                DELETE FROM "irrigation_type" WHERE farm_id = target_farm_id;
                DELETE FROM "harvest_use_type" WHERE farm_id = target_farm_id;
                DELETE FROM "field_work_type" WHERE farm_id = target_farm_id;

                -- Delete specialized task types 
                DELETE FROM "field_work_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "harvest_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "harvest_use" WHERE task_id = ANY(task_ids);
                DELETE FROM "irrigation_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "scouting_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "pest_control_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "soil_amendment_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "soil_sample_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "cleaning_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "plant_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "transplant_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "animal_movement_task" WHERE task_id = ANY(task_ids);

                -- Legacy task types
                DELETE FROM "soil_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "maintenance_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "transport_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "social_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "sale_task" WHERE task_id = ANY(task_ids);
                DELETE FROM "wash_and_pack_task" WHERE task_id = ANY(task_ids);

                -- Delete management task relationships
                DELETE FROM "management_tasks" WHERE task_id = ANY(task_ids);

                -- Finally delete the tasks themselves
                DELETE FROM "task" WHERE task_id = ANY(task_ids);
            
            END IF;
            --------------------------------

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
            WITH farm_management_plan_groups AS (
                SELECT DISTINCT mp.management_plan_group_id
                FROM "management_plan" mp
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = target_farm_id
                AND mp.management_plan_group_id IS NOT NULL
            )
            SELECT array_agg(management_plan_group_id) INTO management_plan_group_ids FROM farm_management_plan_groups;

            -- Delete crop management plans first
            DELETE FROM "crop_management_plan" WHERE management_plan_id IN (
                SELECT mp.management_plan_id 
                FROM "management_plan" mp
                JOIN "crop_variety" cv ON mp.crop_variety_id = cv.crop_variety_id
                WHERE cv.farm_id = target_farm_id
            );

            DELETE FROM "management_plan" WHERE crop_variety_id IN (
                SELECT crop_variety_id FROM "crop_variety" WHERE farm_id = target_farm_id
            );
            IF management_plan_group_ids IS NOT NULL THEN
                DELETE FROM "management_plan_group" WHERE management_plan_group_id = ANY(management_plan_group_ids);
            END IF;

            DELETE FROM "crop_variety_sale" WHERE crop_variety_id IN (
                SELECT crop_variety_id FROM "crop_variety" WHERE farm_id = target_farm_id
            );
            DELETE FROM "crop_variety" WHERE farm_id = target_farm_id;

            -- Delete legacy crop data
            DELETE FROM "waterBalance" WHERE crop_id IN (
                SELECT crop_id FROM "crop" WHERE farm_id = target_farm_id
            );
            DELETE FROM "waterBalanceSchedule" WHERE farm_id = target_farm_id;
            DELETE FROM "cropDisease" WHERE 
                disease_id IN (SELECT disease_id FROM "disease" WHERE farm_id = target_farm_id)
                OR crop_id IN (SELECT crop_id FROM "crop" WHERE farm_id = target_farm_id);

            DELETE FROM "crop" WHERE farm_id = target_farm_id;

            -- Get all location_ids associated with this farm
            SELECT array_agg(location_id) INTO location_ids
            FROM "location"
            WHERE farm_id = target_farm_id;

            -- Delete location data
            IF location_ids IS NOT NULL AND array_length(location_ids, 1) > 0 THEN
                -- Get all figure IDs associated with these locations
                SELECT array_agg(figure_id) INTO figure_ids
                FROM "figure" 
                WHERE location_id IN (SELECT UNNEST(location_ids));
                
                -- Delete geometry data from child tables
                DELETE FROM "area" WHERE figure_id = ANY(figure_ids);
                DELETE FROM "line" WHERE figure_id = ANY(figure_ids);
                DELETE FROM "point" WHERE figure_id = ANY(figure_ids);
                
                -- Now safe to delete the figures themselves
                DELETE FROM "figure" WHERE location_id IN (SELECT UNNEST(location_ids));
                
                -- Then delete from the location type tables
                DELETE FROM "field" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "field" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "garden" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "gate" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "water_valve" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "buffer_zone" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "watercourse" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "fence" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "barn" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "farm_site_boundary" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "natural_area" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "surface_water" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "residence" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "greenhouse" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "ceremonial_area" WHERE location_id IN (SELECT UNNEST(location_ids));
                DELETE FROM "pin" WHERE location_id IN (SELECT UNNEST(location_ids));

                -- Update farm to remove farm_default_initial_location_id reference
                -- (Cicular reference between these two tables)
                UPDATE "farm" 
                SET default_initial_location_id = NULL 
                WHERE farm_id = target_farm_id;

                DELETE FROM "organic_history" WHERE location_id IN (SELECT UNNEST(location_ids));

                -- Finally delete the locations
                DELETE FROM "location" WHERE farm_id = target_farm_id;
            END IF;
            
            -- Delete farm integrations
            DELETE FROM "farm_addon" WHERE farm_id = target_farm_id;
            
            -- Delete farm documents
            DELETE FROM "document" WHERE farm_id = target_farm_id;

            -- Delete products
            DELETE FROM "soil_amendment_product" WHERE product_id IN (
                SELECT product_id FROM "product" WHERE farm_id = target_farm_id
            );
            DELETE FROM "product" WHERE farm_id = target_farm_id;
            
            -- Delete financial data
            DELETE FROM "sale" WHERE farm_id = target_farm_id;
            DELETE FROM "farmExpense" WHERE farm_id = target_farm_id;
            DELETE FROM "farmExpenseType" WHERE farm_id = target_farm_id;
            DELETE FROM "revenue_type" WHERE farm_id = target_farm_id;
            
            -- Delete data from legacy tables
            DELETE FROM "shiftTask" WHERE shift_id IN (
                SELECT shift_id FROM "shift" WHERE farm_id = target_farm_id
            );
            DELETE FROM "shift" WHERE farm_id = target_farm_id;
            DELETE FROM "price" WHERE farm_id = target_farm_id;
            DELETE FROM "yield" WHERE farm_id = target_farm_id;
            DELETE FROM "disease" WHERE farm_id = target_farm_id;
            
            -- Delete certifier survey
            DELETE FROM "organicCertifierSurvey" WHERE farm_id = target_farm_id;

            -- Delete notification data
            DELETE FROM "notification_user" WHERE notification_id IN (
                SELECT notification_id FROM "notification" WHERE farm_id = target_farm_id
            );
            DELETE FROM "notification" WHERE farm_id = target_farm_id;

            -- Delete remaining custom data
            DELETE FROM "task_type" WHERE farm_id = target_farm_id;
            DELETE FROM "fertilizer" WHERE farm_id = target_farm_id;
            DELETE FROM "pesticide" WHERE farm_id = target_farm_id;
            DELETE FROM "userLog" WHERE farm_id = target_farm_id;
            DELETE FROM "finance_report" WHERE farm_id = target_farm_id;

            -- Delete userFarm relationships
            DELETE FROM "userFarm" WHERE farm_id = target_farm_id;
            
            -- Finally delete the farm
            DELETE FROM "farm" WHERE farm_id = target_farm_id;
        END LOOP;
    END IF;

    -- Clean up user data not dependent on farm
    DELETE FROM "userLog" WHERE user_id = target_user_id;
    DELETE FROM "showedSpotlight" WHERE user_id = target_user_id;
    DELETE FROM "password" WHERE user_id = target_user_id;
    DELETE FROM "release_badge" WHERE user_id = target_user_id;
    DELETE FROM "supportTicket" WHERE created_by_user_id = target_user_id;
    
    -- emailToken (invitation) records cannot be deleted without a code change in application; however, single-user farms will not have any email tokens
    DELETE FROM "emailToken" WHERE user_id = target_user_id;

    -- Finally, delete the user
    DELETE FROM "users" WHERE user_id = target_user_id;

    RAISE NOTICE 'Data deletion complete for user_id: %', target_user_id;
END $$;

-- Last chance to ROLLBACK; This will finalize changes. Remove comment to execute.
-- COMMIT;