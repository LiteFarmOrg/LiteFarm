/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import knex from '../util/knex.js';
import * as insightHelpers from '../controllers/insightHelpers.js';

const insightController = {
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
          FROM "task" al, "location_tasks" af, "soil_task" sdl, "location" location, "figure" figure
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
          ORDER BY l.name`,
          [farmID, farmID],
        );

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
          FROM "task" al, "location_tasks" af, "soil_task" sdl, "location" location, "figure" figure
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
          ORDER BY l.name`,
          [farmID, farmID],
        );

        // buffer zones don't have grid_points, add line_points as grid_points to not break in helper function
        bufferZoneData.rows = bufferZoneData.rows.map((bufferZone) => ({
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
          `SELECT t.task_id, t.happiness, t.duration, tt.task_translation_key
            FROM "task" t, "task_type" tt, "location_tasks" lt, "location" l
            WHERE t.task_id = lt.task_id
              AND t.task_type_id = tt.task_type_id
              AND lt.location_id = l.location_id
              AND l.farm_id = ?
              AND t.happiness is not null
            UNION
            SELECT t.task_id, t.happiness, t.duration, tt.task_translation_key
            FROM "task" t, "plant_task" pt, "task_type" tt, "planting_management_plan" pmp, "location" l
            WHERE t.task_id = pt.task_id
              AND pt.planting_management_plan_id = pmp.planting_management_plan_id
              AND t.task_type_id = tt.task_type_id
              AND pmp.location_id = l.location_id
              AND l.farm_id = ?
              AND t.happiness is not null
              UNION
            SELECT t.task_id, t.happiness, t.duration, tt.task_translation_key
            FROM "task" t, "transplant_task" tpt, "task_type" tt, "planting_management_plan" pmp, "location" l
            WHERE t.task_id = tpt.task_id
              AND tpt.planting_management_plan_id = pmp.planting_management_plan_id
              AND t.task_type_id = tt.task_type_id
              AND pmp.location_id = l.location_id
              AND l.farm_id = ?
              AND t.happiness is not null;`,
          [farmID, farmID, farmID],
        );

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
          GROUP BY area.grid_points`,
          [farmID],
        );
        const cropCount = await knex.raw(
          `SELECT DISTINCT crop_variety.crop_variety_id
          FROM "management_plan" mp
          LEFT JOIN "crop_variety"
            on mp.crop_variety_id = crop_variety.crop_variety_id
          WHERE crop_variety.farm_id = ?
            and mp.start_date is not null`,
          [farmID],
        );
        if (dataPoints.rows && cropCount.rows) {
          const count = cropCount.rows.length;
          const body = await insightHelpers.getBiodiversityAPI(dataPoints.rows, count);
          res.status(200).send(body);
        } else {
          res.status(200).send({});
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message ? error.message : error });
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
        const dataPoints = await insightController.queryCropSalesNearByStartDateAndFarmId(
          startDate,
          farmID,
        );

        if (dataPoints.rows) {
          const filtered_datapoints = dataPoints.rows.filter((dataPoint) => {
            const farm_location = dataPoint['grid_points'];
            const field_distance = insightHelpers.distance(
              farm_location['lat'],
              farm_location['lng'],
              parseFloat(myLat),
              parseFloat(myLong),
            );
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
        SELECT to_char(date(s.sale_date), 'YYYY-MM') as year_month, c.crop_common_name, c.crop_translation_key, 
         SUM(cvs.quantity) as sale_quant, SUM(cvs.sale_value) as sale_value, fa.farm_id, fa.grid_points
          FROM "sale" s
        JOIN "crop_variety_sale" cvs on cvs.sale_id = s.sale_id
        JOIN "crop_variety" cv on cvs.crop_variety_id = cv.crop_variety_id
        JOIN "crop" c on c.crop_id = cv.crop_id
          JOIN "farm" fa on fa.farm_id = s.farm_id
          WHERE to_char(date(s.sale_date), 'YYYY-MM') >= to_char(date(?), 'YYYY-MM') and c.crop_id IN (
          SELECT crop_variety.crop_id
        FROM "crop_variety"
        where crop_variety.farm_id = ?)
          GROUP BY year_month, c.crop_common_name, c.crop_translation_key, fa.farm_id
          ORDER BY year_month, c.crop_common_name`,
      [startDate, farmID],
    );
  },
};

export default insightController;
