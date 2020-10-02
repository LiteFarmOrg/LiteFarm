/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (statsController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const userModel = require('../models/userModel');
const fieldModel = require('../models/fieldModel');
const FieldCropController = require('../controllers/fieldCropController');
const logController = require('../controllers/logController');
const logServices = logController.logServices;
const farmExpenseModel = require('../models/farmExpenseModel');
const SaleController = require('../controllers/saleController');
const credentials = require('../credentials');
// const cropModel = require('../models/cropModel');
// const PesticideModel = require('../models/pesiticideModel');
// const DiseaseModel = require('../models/diseaseModel');
// const expenseTypeModel = require('../models/expenseTypeModel');
// const TaskTypeModel = require('../models/TaskTypeModel');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);
const farmModel = require('../models/farmModel');
const insightHelpers = require('../controllers/insightHelpers');
const waterBalanceScheduler = require('../jobs/waterBalance/waterBalance');

class statsController extends baseController {

  static getFarmStats() {

    return async (req, res) => {
      const template = {
        'farm': [],
        'users': [],
        'fields': [],
        'field_crops': [],
        'shifts': [],
        'logs': [],
        'expenses': [],
        'sales': [],
        'people_fed': {},
        'soil_om': [],
        'labour_happiness': [],
        'biodiversity': [],
        'waterbalance': [],
        'nitrogenbalance': [],
      };

      try {
        const access_token = req.query.token;

        const all_tokens = Object.values(credentials.STATS_TOKENS);

        if (!access_token || !all_tokens.includes(access_token)) {
          res.status(400).send({ 'error': 'Missing token' });
          return;
        }

        const farm_id = req.query.farm_id;

        if (!farm_id) {
          res.status(400).send({ 'error': 'Missing farm id' });
          return;
        }

        const users = req.query.users;
        const fields = req.query.fields;
        const field_crops = req.query.field_crops;
        const shifts = req.query.shifts;
        const logs = req.query.logs;
        const expenses = req.query.expenses;
        const sales = req.query.sales;
        const people_fed = req.query.people_fed;
        const soil_om = req.query.soil_om;
        const labour_happiness = req.query.labour_happiness;
        const biodiversity = req.query.biodiversity;
        const waterbalance = req.query.waterbalance;
        const nitrogenbalance = req.query.nitrogenbalance;

        let isAll = false;

        if (req.query.all && req.query.all === 'true'){
          isAll = true;
        }

        template.farm = await baseController.getIndividual(farmModel, farm_id);

        if (users === 'true' || isAll) {
          template.users = await baseController.getByForeignKey(userModel, 'farm_id', farm_id);
        }

        if (fields === 'true' || isAll) {
          template.fields = await baseController.getByForeignKey(fieldModel, 'farm_id', farm_id);
        }

        if (field_crops === 'true' || isAll) {
          template.field_crops = await FieldCropController.getByForeignKey(farm_id);
        }

        if (shifts === 'true' || isAll) {
          const get_shifts = await knex.raw(
            `
          SELECT t.task_id, tp.task_name, t.shift_id, t.is_field, t.field_id, t.field_crop_id, t.duration, s.start_time, s.end_time, s.wage_at_moment, u.user_id, s.mood, u.wage, u.first_name, u.last_name, s.break_duration, x.crop_id, x.crop_common_name
          FROM "shiftTask" t
          LEFT JOIN (
	          SELECT f.field_crop_id, c.crop_id, crop_common_name
	          FROM "fieldCrop" f, "crop" c
	          WHERE f.crop_id = c.crop_id
	          )
	          x ON x.field_crop_id = t.field_crop_id,
	        "shift" s, "users" u, "taskType" tp
          WHERE s.shift_id = t.shift_id AND s.user_id = u.user_id AND u.farm_id = ?
          AND t.task_id = tp.task_id
          `, [farm_id]
          );
          template.shifts = get_shifts.rows;
        }

        if (logs === 'true' || isAll) {
          template.logs = await logServices.getLogByFarm(farm_id);
        }

        if (expenses === 'true' || isAll) {
          template.expenses = await baseController.getByForeignKey(farmExpenseModel, 'farm_id', farm_id);
        }

        if (sales === 'true' || isAll) {
          template.sales = await SaleController.getSalesOfFarm(farm_id);
          for (const sale of template.sales) {
            // load related prices and yields of this sale
            await sale.$loadRelated('cropSale.fieldCrop.crop.[price(getFarm), yield(getFarm)]', {
              getFarm: (builder) => {
                builder.where('farm_id', farm_id);
              },
            });
          }
        }

        if (people_fed === 'true' || isAll) {
          const data = await knex.raw(
            `SELECT DISTINCT cs.sale_id, cs.quantity_kg, c.percentrefuse, c.crop_common_name, c.energy, c.protein, c.lipid, c.vitc, c.vita_rae
          FROM "cropSale" cs, "fieldCrop" fc, "field" f, "crop" c
          WHERE cs.field_crop_id = fc.field_crop_id AND f.farm_id = ? AND fc.crop_id = c.crop_id AND f.field_id = fc.field_id
          ORDER BY cs.sale_id`, [farm_id]
          );

          if (data.rows) {
            const people_fed_data = insightHelpers.getNutritionalData(data.rows);
            const meals = insightHelpers.averagePeopleFedMeals(people_fed_data);
            template.people_fed = {
              preview: meals,
              data: people_fed_data,
            };
          }
        }

        if (soil_om === 'true' || isAll) {
          const data = await knex.raw(
            `SELECT DISTINCT
              f.field_id,
              f.field_name,
              f.grid_points,
              COALESCE(AVG(table_2.om), 0) as om,
              COALESCE(AVG(organic_carbon), 0) as organic_carbon,
              COALESCE(AVG(total_carbon), 0) as total_carbon
          FROM "field" f
          LEFT JOIN (
          SELECT sdl.om, sdl.organic_carbon, sdl.inorganic_carbon, sdl.total_carbon, af.field_id
          FROM "activityLog" al, "activityFields" af, "field" f, "soilDataLog" sdl
          WHERE f.farm_id = ? and f.field_id = af.field_id and al.activity_id = sdl.activity_id and af.activity_id = sdl.activity_id
          ) table_2 ON table_2.field_id = f.field_id
          WHERE f.farm_id = ?
          GROUP BY f.field_id`, [farm_id, farm_id]
          );

          if (data.rows) {
            template.soil_om = await insightHelpers.getSoilOM(data.rows);
          }
        }

        if (labour_happiness === 'true' || isAll) {
          const data = await knex.raw(
            `SELECT DISTINCT t.task_id, s.shift_id, t.task_name, st.duration, s.mood
          FROM "field" f, "shiftTask" st, "taskType" t, "shift" s, "fieldCrop" fc
          WHERE f.farm_id = ? and fc.field_crop_id = st.field_crop_id and fc.field_id = f.field_id and st.task_id = t.task_id and st.shift_id = s.shift_id and s.mood != 'na'
          ORDER BY s.shift_id`, [farm_id]
          );

          if (data.rows) {
            template.labour_happiness = insightHelpers.getLabourHappiness(data.rows);
          }
        }

        if (biodiversity === 'true' || isAll) {
          const dataPoints = await knex.raw(
            `SELECT f.grid_points, COUNT(fc.crop_id)
          FROM "field" f
          LEFT JOIN "fieldCrop" fc
          ON fc.field_id = f.field_id
          WHERE f.farm_id = ?
          GROUP BY f.grid_points`, [farm_id]
          );
          if (dataPoints.rows) {
            template.biodiversity = await insightHelpers.getBiodiversityAPI(dataPoints.rows);
          }
        }

        if (waterbalance === 'true' || isAll) {
          const prevDate = await insightHelpers.formatPreviousDate(new Date(), 'day');
          const dataPoints = await knex.raw(
            `SELECT c.crop_common_name, f.field_name, f.field_id, w.plant_available_water
          FROM "fieldCrop" fc, "field" f, "waterBalance" w, "crop" c
          WHERE fc.field_id = f.field_id and f.farm_id = ? and c.crop_id = w.crop_id and w.field_id = f.field_id and fc.crop_id = w.crop_id and to_char(date(w.created_at), 'YYYY-MM-DD') = ?`,[farm_id, prevDate]
          );
          if (dataPoints.rows > 0){
            if (await waterBalanceScheduler.checkFarmID(farm_id)) {
              template.waterbalance = await insightHelpers.formatWaterBalanceData(dataPoints.rows);
            }
          }
          else{
            template.waterbalance = 'No data yet'
          }
        }

        if (nitrogenbalance === 'true' || isAll) {
          const prevDate = insightHelpers.formatPreviousDate(new Date(), 'year');
          const dataPoints = await knex.raw(
            `SELECT f.field_id, f.field_name, AVG(n.nitrogen_value) as nitrogen_value
          FROM "field" f, "nitrogenBalance" n
          WHERE f.farm_id = ? and n.field_id = f.field_id and to_char(date(n.created_at), 'YYYY-MM-DD') >= '${prevDate}'
          GROUP BY f.field_id`, [farm_id]
          );
          if (dataPoints.rows) {
            template.nitrogenbalance = await insightHelpers.formatNitrogenBalanceData(dataPoints.rows);
          }
        }


        res.status(200).send(template);

      }
      catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    }
  }
}


module.exports = statsController;
