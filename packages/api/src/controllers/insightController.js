/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insightController.js) is part of LiteFarm.
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

const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const { transaction, Model } = require('objection');
const waterBalanceModel = require('../models/waterBalanceModel');
const nitrogenScheduleModel = require('../models/nitrogenScheduleModel');
const baseController = require('../controllers/baseController');
const config = require('../../knexfile')[environment];
const knex = Knex(config);
const insightHelpers = require('../controllers/insightHelpers');
const waterBalanceScheduler = require('../jobs/waterBalance/waterBalance');

class insightController extends baseController {

  // this is for the People Fed module
  static getPeopleFedData() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const data = await knex.raw(
          `SELECT DISTINCT cs.sale_id, cs.quantity_kg, c.percentrefuse, c.crop_common_name, c.energy, c.protein, c.lipid, c.vitc, c.vita_rae
          FROM "cropSale" cs, "sale" s, "crop" c
          WHERE cs.sale_id = s.sale_id AND s.farm_id = ? AND cs.crop_id = c.crop_id`, [farmID]);

        if (data.rows) {
          const people_fed_data = insightHelpers.getNutritionalData(data.rows);
          const meals = insightHelpers.averagePeopleFedMeals(people_fed_data);
          const body = {
            preview: meals,
            data: people_fed_data,
          };
          res.status(200).send(body);
        } else {
          res.status(200).send({
            preview: 0,
            data: [{ label: 'Calories', val: 0, percentage: 0 },
              { label: 'Protein', val: 0, percentage: 0 },
              { label: 'Fat', val: 0, percentage: 0 },
              { label: 'Vitamin C', val: 0, percentage: 0 },
              { label: 'Vitamin A', val: 0, percentage: 0 }],
          });
        }
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    }
  }

  // this is for the soil om submodule
  static getSoilDataByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        // Note that soil analysis could have been done on some fields but
        // not the others - the left join ensures that all fields are returned.
        // However, for fields that don't have soil analysis data, they will
        // have null values for the om values. Hence, we need to return 0 by default.
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
          GROUP BY f.field_id
          ORDER BY f.field_name`, [farmID, farmID]);

        if (data.rows) {
          const body = await insightHelpers.getSoilOM(data.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    }
  }

  static getLabourHappinessByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const data = await knex.raw(
          `SELECT DISTINCT t.task_id, s.shift_id, t.task_name, st.duration, s.mood
          FROM "field" f, "shiftTask" st, "taskType" t, "shift" s, "fieldCrop" fc
          WHERE f.farm_id = ? and fc.field_crop_id = st.field_crop_id and fc.field_id = f.field_id and st.task_id = t.task_id and st.shift_id = s.shift_id and s.mood != 'na'
          ORDER BY s.shift_id`, [farmID]);

        if (data.rows) {
          const body = insightHelpers.getLabourHappiness(data.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  }

  static getBiodiversityByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT f.grid_points, COUNT(fc.crop_id)
          FROM "field" f
          LEFT JOIN "fieldCrop" fc
          ON fc.field_id = f.field_id
          WHERE f.farm_id = ?
          GROUP BY f.grid_points`, [farmID]);
        if (dataPoints.rows) {
          const body = await insightHelpers.getBiodiversityAPI(dataPoints.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({})
        }
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  }

  static getPricesNearbyByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const distance = req.query.distance;
        const myLat = req.query.lat;
        const myLong = req.query.long;
        const startDate = req.query.startdate;
        const dataPoints = await knex.raw(
          `
          SELECT to_char(date(s.sale_date), 'YYYY-MM') as year_month, c.crop_common_name, SUM(cs.quantity_kg) as sale_quant, SUM(cs.sale_value) as sale_value, fa.farm_id, fa.grid_points
          FROM "sale" s
          JOIN "cropSale" cs on cs.sale_id = s.sale_id
          JOIN "crop" c on c.crop_id = cs.crop_id
          JOIN "farm" fa on fa.farm_id = s.farm_id
          WHERE s.sale_date >= ? and c.crop_id IN (
          SELECT fc.crop_id
          FROM "fieldCrop" fc, "field" f
          WHERE fc.field_id = f.field_id and f.farm_id = ?)
          GROUP BY year_month, c.crop_common_name, fa.farm_id, fa.grid_points
          ORDER BY year_month, c.crop_common_name`, [startDate, farmID]);
        if (dataPoints.rows) {
          const filtered_datapoints = dataPoints.rows.filter((dataPoint) => {
            const farm_location = dataPoint['grid_points'];
            const field_distance = insightHelpers.distance(farm_location['lat'], farm_location['lng'], parseFloat(myLat), parseFloat(myLong), 'K');
            return field_distance < distance
          });
          const body = insightHelpers.formatPricesNearbyData(farmID, filtered_datapoints);
          res.status(200).send(body)
        } else {
          res.status(200).send({})
        }

      } catch (error) {
        res.status(400).json({ error })
      }
    }
  }

  static getWaterBalance() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const prevDate = await insightHelpers.formatPreviousDate(new Date(), 'day');
        const dataPoints = await knex.raw(
          `SELECT c.crop_common_name, f.field_name, f.field_id, w.plant_available_water
          FROM "fieldCrop" fc, "field" f, "waterBalance" w, "crop" c
          WHERE fc.field_id = f.field_id and f.farm_id = ? and c.crop_id = w.crop_id and w.field_id = f.field_id and
           fc.crop_id = w.crop_id and to_char(date(w.created_at), 'YYYY-MM-DD') = ?`, [farmID, prevDate]);
        if (dataPoints.rows) {
          const body = await insightHelpers.formatWaterBalanceData(dataPoints.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({ preview: 0, data: {} })
        }
      } catch (error) {
        res.status(400).json({ error })
      }
    }
  }

  static addWaterBalanceSchedule() {
    return async (req, res) => {
      try {
        const body = req.body;
        await waterBalanceScheduler.registerFarmID(body.farm_id);
        res.status(200).send({ preview: 0, data: 'Registered Farm ID' })
      } catch (e) {
        res.status(400).json({ e })
      }
    }
  }

  static getWaterSchedule() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "waterBalanceSchedule" w
          WHERE w.farm_id = ?`, [farmID]);
        if (dataPoints.rows.length > 0) {
          const body = dataPoints.rows[0];
          res.status(200).send(body)
        } else {
          res.status(200).send({})
        }
      } catch (e) {
        res.status(400).json({ e })
      }
    }
  }

  static getNitrogenBalance() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const prevDate = insightHelpers.formatPreviousDate(new Date(), 'year');
        const dataPoints = await knex.raw(
          `SELECT f.field_id, f.field_name, AVG(n.nitrogen_value) as nitrogen_value
      FROM "field" f, "nitrogenBalance" n
      WHERE f.farm_id = ? and n.field_id = f.field_id and to_char(date(n.created_at), 'YYYY-MM-DD') >= ?
      GROUP BY f.field_id`, [farmID, prevDate]);
        if (dataPoints.rows.length > 0) {
          const body = await insightHelpers.formatNitrogenBalanceData(dataPoints.rows);
          res.status(200).send(body)
        } else {
          res.status(200).send({ preview: 0, data: 'No data yet' })
        }
      } catch (error) {
        res.status(400).json({ error })
      }
    }
  }

  static getNitrogenSchedule() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "nitrogenSchedule" n
          WHERE n.farm_id = ?
          ORDER BY n.scheduled_at DESC`, [farmID]
        );
        if (dataPoints.rows) {
          const body = dataPoints.rows[0];
          res.status(200).send(body);
        } else {
          res.status(404).json({ error: 'no data' })
        }

      } catch (error) {
        res.status(400).json({ error })
      }
    }
  }

  static addWaterBalance() {
    let trx;
    return async (req, res) => {
      const body = req.body;
      trx = await transaction.start(Model.knex());
      try {
        const waterBalanceResult = await baseController.postWithResponse(waterBalanceModel, body, trx);
        await trx.commit();
        res.status(201).send(waterBalanceResult)
      } catch (error) {
        await trx.rollback();
        res.status(400).json({ error })
      }
    }
  }

  static addNitrogenSchedule() {
    let trx;
    return async (req, res) => {
      const body = req.body;
      trx = await transaction.start(Model.knex());
      try {
        const nitrogenScheduleResult = await baseController.postWithResponse(nitrogenScheduleModel, body, trx);
        await trx.commit();
        res.status(201).send(nitrogenScheduleResult)
      } catch (error) {
        await trx.rollback();
        res.status(400).json({ error })
      }
    }
  }

  static delNitrogenSchedule() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(nitrogenScheduleModel, req.params.nitrogen_schedule_id, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }
}


module.exports = insightController;
