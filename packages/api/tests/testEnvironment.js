/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (testEnvironment.js) is part of LiteFarm.
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

// import NodeEnvironment from 'jest-environment-node';
//
// class TestEnvironment extends NodeEnvironment {
//   constructor(config) {
//     super(config);
//   }
//
//   async setup() {
//     await super.setup();
//   }
//   async teardown() {
//     await super.teardown();
//   }
//
//   runScript(script) {
//     return super.runScript(script);
//   }
// }

async function tableCleanup(knex) {
  await knex('farm')
    .whereNotNull('default_initial_location_id')
    .update({ default_initial_location_id: null });
  return knex.raw(`
    DELETE FROM "farm_addon";
    DELETE FROM "addon_partner"; 
    DELETE FROM "notification_user";
    DELETE FROM "notification";
    DELETE FROM "supportTicket";
    DELETE FROM "organicCertifierSurvey";
    DELETE FROM "password";
    DELETE FROM "showedSpotlight";
    DELETE FROM "userLog";
    DELETE FROM "location_tasks";
    DELETE FROM "field_work_task";
    DELETE FROM "field_work_type";
    DELETE FROM "harvest_use";
    DELETE FROM "harvest_task";
    DELETE FROM "harvest_use_type";
    DELETE FROM "irrigation_task";
    DELETE FROM "scouting_task";
    DELETE FROM "pest_control_task";
    DELETE FROM "social_task";
    DELETE FROM "transport_task";
    DELETE FROM "sale_task";
    DELETE FROM "wash_and_pack_task";
    DELETE FROM "cleaning_task";
    DELETE FROM "soil_amendment_task";
    DELETE FROM "soil_amendment_task_products_purpose_relationship";
    DELETE FROM "soil_amendment_task_products";
    DELETE FROM "soil_amendment_purpose";
    DELETE FROM "soil_amendment_method";
    DELETE FROM "soil_amendment_product";
    DELETE FROM "soil_amendment_fertiliser_type";
    DELETE FROM "soil_sample_task";
    DELETE FROM "product";
    DELETE FROM "management_tasks";
    DELETE FROM "plant_task";
    DELETE FROM "transplant_task";
    DELETE FROM "soil_task";
    DELETE FROM "animal_movement_task_purpose_relationship"; 
    DELETE FROM "animal_movement_purpose"; 
    DELETE FROM "animal_movement_task";
    DELETE FROM "task_animal_relationship";
    DELETE FROM "task_animal_batch_relationship";
    DELETE FROM "task";
    DELETE FROM "yield";
    DELETE FROM "cropDisease";
    DELETE FROM "price";
    DELETE FROM "crop_variety_sale";
    DELETE FROM "sale";
    DELETE FROM "revenue_type";
    DELETE FROM "broadcast_method";
    DELETE FROM "container_method";
    DELETE FROM "row_method";
    DELETE FROM "bed_method";
    DELETE FROM "planting_management_plan";
    DELETE FROM "crop_management_plan";
    DELETE FROM "management_plan";
    DELETE FROM "management_plan_group";
    DELETE FROM "crop_variety";
    DELETE FROM "crop";
    DELETE FROM "field";
    DELETE FROM "garden";
    DELETE FROM "area";
    DELETE FROM "line";
    DELETE FROM "point";
    DELETE FROM "figure";
    DELETE FROM "barn";
    DELETE FROM "greenhouse";
    DELETE FROM "gate";
    DELETE FROM "water_valve";
    DELETE FROM "soil_sample_location";
    DELETE FROM "buffer_zone";
    DELETE FROM "watercourse";
    DELETE FROM "fence";
    DELETE FROM "ceremonial_area";
    DELETE FROM "residence";
    DELETE FROM "farm_site_boundary";
    DELETE FROM "surface_water";
    DELETE FROM "natural_area";
    DELETE FROM "organic_history";
    DELETE FROM "fertilizer";
    DELETE FROM "farmExpense";
    DELETE FROM "farmExpenseType";
    DELETE FROM "revenue_type";
    DELETE FROM "disease";
    DELETE FROM "pesticide";
    DELETE FROM "task_type";
    DELETE FROM "farmDataSchedule";
    DELETE FROM "animal_use_relationship";
    DELETE FROM "animal_batch_use_relationship";
    DELETE FROM "animal_group_relationship";
    DELETE FROM "animal_batch_group_relationship";
    DELETE FROM "animal_group";
    DELETE FROM "animal";
    DELETE FROM "animal_batch_sex_detail";
    DELETE FROM "animal_batch";
    DELETE FROM "animal_sex";
    DELETE FROM "animal_identifier_color";
    DELETE FROM "animal_identifier_type";
    DELETE FROM "animal_origin";
    DELETE FROM "animal_type_use_relationship";
    DELETE FROM "animal_use";
    DELETE FROM "default_animal_breed";
    DELETE FROM "custom_animal_breed";
    DELETE FROM "default_animal_type";
    DELETE FROM "custom_animal_type";
    DELETE FROM "animal_removal_reason";
    DELETE FROM "farm_addon";
    DELETE FROM "addon_partner";
    DELETE FROM "location";
    DELETE FROM "userFarm";
    DELETE FROM "farm";
    DELETE FROM "users" WHERE user_id <> '1';
    DELETE FROM "weather_station";
  `);
}

export { tableCleanup };
