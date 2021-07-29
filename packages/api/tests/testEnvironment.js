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

const NodeEnvironment = require('jest-environment-node');


class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
  }
  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

async function tableCleanup(knex) {
  return knex.raw(`
    DELETE FROM "supportTicket";
    DELETE FROM "organicCertifierSurvey";
    DELETE FROM "password";
    DELETE FROM "showedSpotlight";
    DELETE FROM "userLog";
    DELETE FROM "location_tasks";
    DELETE FROM "field_work_task";
    DELETE FROM "harvestUse";
    DELETE FROM "harvest_task";
    DELETE FROM "harvestUseType";
    DELETE FROM "irrigation_task";
    DELETE FROM "management_tasks";
    DELETE FROM "scouting_task";
    DELETE FROM "pest_control_task";
    DELETE FROM "fertilizer_task";
    DELETE FROM "plant_task";
    DELETE FROM "soil_task";
    DELETE FROM "task";
    DELETE FROM "yield";
    DELETE FROM "cropDisease";
    DELETE FROM "price";
    DELETE FROM "cropSale";
    DELETE FROM "sale";
    DELETE FROM "waterBalance";
    DELETE FROM "nitrogenBalance";
    DELETE FROM "broadcast";
    DELETE FROM "container";
    DELETE FROM "rows";
    DELETE FROM "beds";
    DELETE FROM "transplant_container";
    DELETE FROM "crop_management_plan";
    DELETE FROM "management_plan";
    DELETE FROM "crop_variety";
    DELETE FROM "crop";
    DELETE FROM "shiftTask";
    DELETE FROM "shift";
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
    DELETE FROM "buffer_zone";
    DELETE FROM "watercourse";
    DELETE FROM "fence";
    DELETE FROM "ceremonial_area";
    DELETE FROM "residence";
    DELETE FROM "farm_site_boundary";
    DELETE FROM "surface_water";
    DELETE FROM "natural_area";
    DELETE FROM "location";
    DELETE FROM "fertilizer";
    DELETE FROM "farmExpense";
    DELETE FROM "farmExpenseType";
    DELETE FROM "disease";
    DELETE FROM "pesticide";
    DELETE FROM "task_type";
    DELETE FROM "farmDataSchedule";
    DELETE FROM "userFarm";
    DELETE FROM "waterBalanceSchedule";
    DELETE FROM "nitrogenSchedule";
    DELETE FROM "farm";
    DELETE FROM "users";
    DELETE FROM "weatherHourly";
    DELETE FROM "weather";
    DELETE FROM "weather_station";
  `);
}

module.exports = { TestEnvironment, tableCleanup };
