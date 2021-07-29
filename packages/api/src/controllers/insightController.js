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


const { transaction, Model } = require('objection');
const waterBalanceModel = require('../models/waterBalanceModel');
const nitrogenScheduleModel = require('../models/nitrogenScheduleModel');
const baseController = require('../controllers/baseController');
const knex = Model.knex();
const insightHelpers = require('../controllers/insightHelpers');
const waterBalanceScheduler = require('../jobs/waterBalance/waterBalance');
// TODO: put nitrogen scheduler here for when we want to put it back

const insightController = {

  // this is for the People Fed module
  getPeopleFedData() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const saleData = await knex.raw(
          `SELECT DISTINCT cs.sale_id as id, cs.quantity_kg, c.percentrefuse, c.crop_common_name, c.energy, c.protein, c.lipid, c.vitc, c.vita_rae
              FROM "cropSale" cs JOIN "sale" s ON cs.sale_id = s.sale_id
              JOIN "crop" c ON cs.crop_id = c.crop_id
              WHERE s.farm_id = ? AND s.deleted = FALSE`, [farmID]);
        const harvestData = await knex.raw(
          `SELECT DISTINCT hu.harvest_use_id as id, hu.quantity_kg, c.percentrefuse, c.crop_common_name, c.energy, c.protein, c.lipid, c.vitc, c.vita_rae
                FROM "harvestUse" hu 
                JOIN "task" al ON hu.task_id = al.task_id
                JOIN "management_tasks" ac ON hu.task_id = ac.task_id 
                JOIN "management_plan" mp ON mp.management_plan_id = ac.management_plan_id
                JOIN "location" ON mp.location_id = location.location_id
                JOIN "crop_variety" ON mp.crop_variety_id = crop_variety.crop_variety_id
                JOIN "crop" c ON mp.crop_id = c.crop_id
                WHERE location.farm_id = ? AND al.deleted = FALSE
                AND hu.harvest_use_type_id IN (2,5,6)`, [farmID]);
        const data = saleData.rows.concat(harvestData.rows);
        if (data) {
          const people_fed_data = insightHelpers.getNutritionalData(data);
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
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  // this is for the soil om submodule
  getSoilDataByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        // Note that soil analysis could have been done on some fields but
        // not the others - the left join ensures that all fields are returned.
        // However, for fields that don't have soil analysis data, they will
        // have null values for the om values. Hence, we need to return 0 by default.
        const areaData = await knex.raw(
          `SELECT DISTINCT
            l.location_id,
            l.name,
            area.grid_points,
            COALESCE(AVG(table_2.om), 0) as om,
            COALESCE(AVG(organic_carbon), 0) as organic_carbon,
            COALESCE(AVG(total_carbon), 0) as total_carbon
          FROM "location" l
          LEFT JOIN "farm_site_boundary" fsb on fsb.location_id = l.location_id
          LEFT JOIN "barn" b on b.location_id = l.location_id
          LEFT JOIN "ceremonial_area" ca on ca.location_id = l.location_id
          LEFT JOIN "surface_water" sw on sw.location_id = l.location_id
          LEFT JOIN "natural_area" na on na.location_id = l.location_id
          LEFT JOIN "residence" r on r.location_id = l.location_id
--          LEFT JOIN "greenhouse" g on g.location_id = l.location_id
          JOIN "figure" on figure.location_id = l.location_id
          JOIN "area" on area.figure_id = figure.figure_id
          LEFT JOIN (
          SELECT sdl.om, sdl.organic_carbon, sdl.inorganic_carbon, sdl.total_carbon, af.location_id
          FROM "task" al, "activityFields" af, "soilDataLog" sdl, "location" location, "figure" figure
          WHERE location.farm_id = ?
            and location.location_id = af.location_id
            and al.task_id = sdl.task_id
            and al.deleted = false
            and af.task_id = sdl.task_id
            and figure.location_id = location.location_id
          ) table_2 ON table_2.location_id = l.location_id
          WHERE l.farm_id = ?
            AND l.deleted = false
            AND fsb.location_id IS NULL
            AND b.location_id IS NULL
            AND ca.location_id IS NULL
            AND sw.location_id IS NULL
            AND na.location_id IS NULL
            AND r.location_id IS NULL
--            AND g.location_id IS NULL
          GROUP BY l.location_id, l.name, area.grid_points
          ORDER BY l.name`, [farmID, farmID]);

        const bufferZoneData = await knex.raw(
          `SELECT DISTINCT
            l.location_id,
            l.name,
            line.line_points,
            COALESCE(AVG(table_2.om), 0) as om,
            COALESCE(AVG(organic_carbon), 0) as organic_carbon,
            COALESCE(AVG(total_carbon), 0) as total_carbon
          FROM "location" l
          JOIN "buffer_zone" bf on bf.location_id = l.location_id
          JOIN "figure" on figure.location_id = l.location_id
          JOIN "line" on line.figure_id = figure.figure_id
          LEFT JOIN (
          SELECT sdl.om, sdl.organic_carbon, sdl.inorganic_carbon, sdl.total_carbon, af.location_id
          FROM "task" al, "activityFields" af, "soilDataLog" sdl, "location" location, "figure" figure
          WHERE location.farm_id = ?
            and location.location_id = af.location_id
            and al.task_id = sdl.task_id
            and al.deleted = false
            and af.task_id = sdl.task_id
            and figure.location_id = location.location_id
          ) table_2 ON table_2.location_id = l.location_id
          WHERE l.farm_id = ?
            AND l.deleted = false
          GROUP BY l.location_id, l.name, line.line_points
          ORDER BY l.name`, [farmID, farmID]);

        // buffer zones don't have grid_points, add line_points as grid_points to not break in helper function
        bufferZoneData.rows = bufferZoneData.rows.map(bufferZone => ({
          ...bufferZone,
          grid_points: bufferZone.line_points,
        }));

        const data = areaData.rows.concat(bufferZoneData.rows);
        if (data) {
          const body = await insightHelpers.getSoilOM(data);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  getLabourHappinessByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const data = await knex.raw(
          `SELECT DISTINCT t.task_id, s.shift_id, t.task_name, st.duration, s.mood, t.task_translation_key, mp.management_plan_id, l.location_id
          FROM "shiftTask" st
            JOIN "shift" s ON s.shift_id = st.shift_id
            JOIN "taskType" t ON st.task_id = t.task_id
            LEFT JOIN "management_plan" mp ON mp.management_plan_id = st.management_plan_id
            LEFT JOIN "location" l ON l.location_id = st.location_id
            WHERE s.farm_id = ?
              and s.mood != 'na'
              and s.mood != 'no answer'
              and s.deleted = false`, [farmID]);

        if (data.rows) {
          const body = insightHelpers.getLabourHappiness(data.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },

  getBiodiversityByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT area.grid_points
          FROM "farm_site_boundary" fsb
          JOIN "location" on location.location_id = fsb.location_id
          JOIN "figure" on figure.location_id = location.location_id
          JOIN "area" on figure.figure_id = area.figure_id
          WHERE location.farm_id = ?
          AND location.deleted = false
          GROUP BY area.grid_points`, [farmID]);
        const cropCount = await knex.raw(
          `SELECT DISTINCT crop_variety.crop_id
          FROM "location" l
          LEFT JOIN "management_plan" mp
            on mp.location_id = l.location_id
          LEFT JOIN "crop_variety"
            on mp.crop_variety_id = crop_variety.crop_variety_id
          WHERE l.farm_id = ?
            and mp.end_date >= NOW() and mp.start_date <= NOW()`, [farmID]);
        if (dataPoints.rows && cropCount.rows) {
          const count = cropCount.rows.length;
          const body = await insightHelpers.getBiodiversityAPI(dataPoints.rows, count);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  getPricesNearbyByFarmID() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const distance = req.query.distance;
        const myLat = req.query.lat;
        const myLong = req.query.long;
        const startDate = req.query.startdate;
        const dataPoints = await insightController.queryCropSalesNearByStartDateAndFarmId(startDate, farmID);

        if (dataPoints.rows) {
          const filtered_datapoints = dataPoints.rows.filter((dataPoint) => {
            const farm_location = dataPoint['grid_points'];
            const field_distance = insightHelpers.distance(farm_location['lat'], farm_location['lng'], parseFloat(myLat), parseFloat(myLong));
            return field_distance < distance;
          });
          const body = insightHelpers.formatPricesNearbyData(farmID, filtered_datapoints);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }

      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  async queryCropSalesNearByStartDateAndFarmId(startDate, farmID) {
    return await knex.raw(
      `
          SELECT to_char(date(s.sale_date), 'YYYY-MM') as year_month, c.crop_common_name, c.crop_translation_key, SUM(cs.quantity_kg) as sale_quant, SUM(cs.sale_value) as sale_value, fa.farm_id, fa.grid_points
          FROM "sale" s
          JOIN "cropSale" cs on cs.sale_id = s.sale_id
          JOIN "crop" c on c.crop_id = cs.crop_id
          JOIN "farm" fa on fa.farm_id = s.farm_id
          WHERE to_char(date(s.sale_date), 'YYYY-MM') >= to_char(date(?), 'YYYY-MM') and c.crop_id IN (
          SELECT crop_variety.crop_id
          FROM "management_plan" mp 
          join "location" on mp.location_id = location.location_id
          join "crop_variety" on crop_variety.crop_variety_id = mp.crop_variety_id
          where location.farm_id = ?)
          GROUP BY year_month, c.crop_common_name, c.crop_translation_key, fa.farm_id
          ORDER BY year_month, c.crop_common_name`, [startDate, farmID]);
  },

  getWaterBalance() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const prevDate = await insightHelpers.formatPreviousDate(new Date(), 'day');
        const dataPoints = await knex.raw(
          `SELECT c.crop_common_name, location.name, location.location_id, w.plant_available_water
          FROM "management_plan" mp, "location", "waterBalance" w, "crop" c, "crop_variety"
          WHERE mp.location_id = location.location_id and location.farm_id = ? and c.crop_id = w.crop_id and w.location_id = location.location_id and
           mp.crop_variety_id = crop_variety.crop_variety_id and crop_variety.crop_id = w.crop_id and to_char(date(w.created_at), 'YYYY-MM-DD') = ?`, [farmID, prevDate]);
        if (dataPoints.rows) {
          const body = await insightHelpers.formatWaterBalanceData(dataPoints.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({ preview: 0, data: {} });
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  addWaterBalanceSchedule() {
    return async (req, res) => {
      try {
        const body = req.body;
        await waterBalanceScheduler.registerFarmID(body.farm_id);
        res.status(200).send({ preview: 0, data: 'Registered Farm ID' });
      } catch (e) {
        res.status(400).json({ e });
      }
    };
  },

  getWaterSchedule() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "waterBalanceSchedule" w
          WHERE w.farm_id = ?`, [farmID]);
        if (dataPoints.rows.length > 0) {
          const body = dataPoints.rows[0];
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (e) {
        res.status(400).json({ e });
      }
    };
  },

  getNitrogenBalance() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const prevDate = insightHelpers.formatPreviousDate(new Date(), 'year');
        const dataPoints = await knex.raw(
          `SELECT location.location_id, location.name, AVG(n.nitrogen_value) as nitrogen_value
            FROM "location", "nitrogenBalance" n
            WHERE location.farm_id = ? and n.location_id = location.location_id and to_char(date(n.created_at), 'YYYY-MM-DD') >= ?
            GROUP BY location.location_id`, [farmID, prevDate]);
        if (dataPoints.rows.length > 0) {
          const body = await insightHelpers.formatNitrogenBalanceData(dataPoints.rows);
          res.status(200).send(body);
        } else {
          res.status(200).send({ preview: 0, data: 'No data yet' });
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  getNitrogenSchedule() {
    return async (req, res) => {
      try {
        const farmID = req.params.farm_id;
        const dataPoints = await knex.raw(
          `SELECT *
          FROM "nitrogenSchedule" n
          WHERE n.farm_id = ?
          ORDER BY n.scheduled_at DESC`, [farmID],
        );
        if (dataPoints.rows) {
          const body = dataPoints.rows[0];
          res.status(200).send(body);
        } else {
          res.status(404).json({ error: 'no data' });
        }

      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },

  addWaterBalance() {
    let trx;
    return async (req, res) => {
      const body = req.body;
      trx = await transaction.start(Model.knex());
      try {
        const waterBalanceResult = await baseController.postWithResponse(waterBalanceModel, body, req, { trx });
        await trx.commit();
        res.status(201).send(waterBalanceResult);
      } catch (error) {
        await trx.rollback();
        res.status(400).json({ error });
      }
    };
  },

  addNitrogenSchedule() {
    let trx;
    return async (req, res) => {
      const body = req.body;
      trx = await transaction.start(Model.knex());
      try {
        const nitrogenScheduleResult = await baseController.postWithResponse(nitrogenScheduleModel, body, req, { trx });
        await trx.commit();
        res.status(201).send(nitrogenScheduleResult);
      } catch (error) {
        await trx.rollback();
        res.status(400).json({ error });
      }
    };
  },

  delNitrogenSchedule() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(nitrogenScheduleModel, req.params.nitrogen_schedule_id, req, { trx });
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
    };
  },
};


module.exports = insightController;
