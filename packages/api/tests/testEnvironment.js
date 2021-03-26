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
const getAuthToken = require('./setup');

class TestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    this.global.token = await getAuthToken();
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
    DELETE FROM "activityFields";
    DELETE FROM "fieldWorkLog";
    DELETE FROM "harvestUse";
    DELETE FROM "harvestLog";
    DELETE FROM "harvestUseType";
    DELETE FROM "irrigationLog";
    DELETE FROM "activityCrops";
    DELETE FROM "scoutingLog";
    DELETE FROM "pestControlLog";
    DELETE FROM "fertilizerLog";
    DELETE FROM "seedLog";
    DELETE FROM "soilDataLog";
    DELETE FROM "activityLog";
    DELETE FROM "yield";
    DELETE FROM "cropDisease";
    DELETE FROM "price";
    DELETE FROM "cropSale";
    DELETE FROM "sale";
    DELETE FROM "waterBalance";
    DELETE FROM "nitrogenBalance";
    DELETE FROM "fieldCrop";
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
    DELETE FROM "creek";
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
    DELETE FROM "taskType";
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
