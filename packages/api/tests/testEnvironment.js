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

function tableCleanup(knex) {
  return knex.raw(`
    TRUNCATE "activityFields", "fieldWorkLog", "harvestLog", "irrigationLog", "activityCrops", "scoutingLog",
    "pestControlLog", "fertilizerLog", "seedLog", "soilDataLog", "userTodo", "todo", "activityLog", "notification",
    "yield", "cropCommonName", "cropDisease", "price", "cropSale", "sale", "waterBalance", "nitrogenBalance",
    "fieldCrop", "crop", "shiftTask", "shift", "field", "fertilizer", "farmExpense", "farmExpenseType", "disease",
    "pesticide", "taskType", "farmDataSchedule", "userFarm", "waterBalanceSchedule", "plan", "nitrogenSchedule",
    "users", "farm", "weatherHourly", "weather", "weather_station" CASCADE;
  `)
}

module.exports = { TestEnvironment, tableCleanup };
