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

-- @description: Defines all tables queried by export and delete scripts

-- @description returns tables related to task_products_id
CREATE OR REPLACE FUNCTION get_task_product_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'soil_amendment_task_products_purpose_relationship'
    ]);
$$;

-- @description returns tables related to task_id
CREATE OR REPLACE FUNCTION get_task_tables()
  RETURNS TABLE(table_name TEXT) 
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
        -- relationship tables
        'location_tasks',
        'task_document',
        'management_tasks',
        'animal_movement_task_purpose_relationship',
        'task_animal_relationship',
        'task_animal_batch_relationship',
        'soil_amendment_task_products',

        -- task types
        'field_work_task',
        'harvest_task',
        'harvest_use',
        'irrigation_task',
        'scouting_task',
        'pest_control_task',
        'soil_amendment_task',
        'soil_sample_task',
        'cleaning_task',
        'plant_task',
        'transplant_task',
        'animal_movement_task',

        -- legacy task types
        'soil_task',
        'maintenance_task',
        'transport_task',
        'social_task',
        'sale_task',
        'wash_and_pack_task',

        'task'
    ]);
$$;

-- @description returns tables related to planting_management_plan_id
CREATE OR REPLACE FUNCTION get_pmp_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'container_method',
      'broadcast_method',
      'bed_method',
      'row_method',
      'planting_management_plan'
    ]);
$$;

-- @description returns tables related to management_plan_id
CREATE OR REPLACE FUNCTION get_management_plan_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'crop_management_plan',
      'management_plan'
    ]);
$$;

-- @description returns tables related to management_plan_group_id 
CREATE OR REPLACE FUNCTION get_mp_repetition_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'management_plan_group'
    ]);
$$;

-- @description returns tables related to animal_id
CREATE OR REPLACE FUNCTION get_animal_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'animal_use_relationship',
      'animal_group_relationship'
    ]);
$$;

-- @description returns tables related to animal_batch_id
CREATE OR REPLACE FUNCTION get_animal_batch_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'animal_batch_use_relationship',
      'animal_batch_group_relationship',
      'animal_batch_sex_detail'
    ]);
$$;

-- @description returns tables related to figure_id
CREATE OR REPLACE FUNCTION get_figure_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'area',
      'line',
      'point',
      'figure'
    ]);
$$;

-- @description returns tables related to location_id
CREATE OR REPLACE FUNCTION get_location_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'field',
      'garden',
      'gate',
      'water_valve',
      'buffer_zone',
      'soil_sample_location',
      'watercourse',
      'fence',
      'barn',
      'farm_site_boundary',
      'natural_area',
      'surface_water',
      'residence',
      'greenhouse',
      'ceremonial_area',
      'organic_history',

      -- animal & batches specified to a location via movement task
      'animal',
      'animal_batch',

      -- legacy tables with location_id
      'nitrogenBalance',

      'location'
    ]);
$$;

-- @description as above, but removing redundant tables for export
CREATE OR REPLACE FUNCTION get_location_export_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT table_name
      FROM get_location_tables()
     WHERE table_name NOT IN (
       'animal','animal_batch'
     );
$$;

-- @description returns tables related to farm_id via a join on a secondary table
CREATE OR REPLACE FUNCTION get_secondary_tables()
  RETURNS TABLE(child_table TEXT,join_table TEXT,join_key TEXT)
LANGUAGE sql AS $$
SELECT * FROM (
 VALUES
  ('soil_amendment_product','product','product_id'),
  ('crop_variety_sale','crop_variety','crop_variety_id'),
  ('notification_user','notification','notification_id'),
  ('nomination_crop','nomination','nomination_id'),
  ('nomination_status','nomination','nomination_id'),
  ('file', 'document', 'document_id'),

  -- legacy
  ('cropDisease','disease','disease_id'),
  ('cropDisease','crop','crop_id'),
  ('shiftTask','shift','shift_id'),
  ('waterBalance','crop','crop_id')
) AS t(child_table,join_table,join_key);
$$;


-- @description returns tables related to farm_id
CREATE OR REPLACE FUNCTION get_farm_scoped_tables()
  RETURNS TABLE(table_name TEXT) 
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      -- financial data
      'sale',
      'farmExpense',
      'revenue_type',
      'farmExpenseType',
      'finance_report',

      -- legacy crop data
      'waterBalanceSchedule',
      'price',
      'yield',

      -- crop data
      'crop_variety',
      'crop',

      -- animal data
      'animal',
      'animal_batch',
      'custom_animal_breed',
      'custom_animal_type',
    --   'animal_group', -- has wrong schema for farm_id, but no data on prod anyway

      -- custom task data
      'irrigation_type',
      'harvest_use_type',
      'field_work_type',
      'task_type',

      -- other legacy tables
      'shift',
      'disease',
      'fertilizer',
      'pesticide',
      'nitrogenSchedule',

      -- remaining custom data
      'organicCertifierSurvey',
      'notification',
      'nomination',
      'farm_addon',
      'document',
      'product',
      'userLog',
      'userFarm',
      'farm'
    ]);
$$;

-- @description as above, but removing redundant tables for export
CREATE OR REPLACE FUNCTION get_farm_export_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT table_name
      FROM get_farm_scoped_tables()
     WHERE table_name NOT IN (
       'userLog'
     );
$$;

-- @description returns tables related to user_id via created_by_user_id
CREATE OR REPLACE FUNCTION get_created_by_user_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'supportTicket'
    ]);
$$;

-- @description returns tables related to user_id
CREATE OR REPLACE FUNCTION get_user_scoped_tables()
  RETURNS TABLE(table_name TEXT)
  LANGUAGE sql AS $$
    SELECT unnest(ARRAY[
      'userLog',
      'password',
      'showedSpotlight',
      'release_badge',

      -- invite tokens are not possible for single userFarm farms
      -- LF-4895 should be addressed if deletion is expanded beyond that
      'emailToken',

      'users'
    ]);
$$;