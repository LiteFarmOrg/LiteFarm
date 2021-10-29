/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerController.js) is part of LiteFarm.
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

const organicCertifierSurveyModel = require('../models/organicCertifierSurveyModel');
const certificationModel = require('../models/certificationModel');
const certifierModel = require('../models/certifierModel');
const userModel = require('../models/userModel');
const farmModel = require('../models/farmModel');
const documentModel = require('../models/documentModel');
const knex = require('./../util/knex');
const Queue = require('bull');
const redisConf = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
}

const organicCertifierSurveyController = {
  getCertificationSurveyByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await organicCertifierSurveyModel.query().whereNotDeleted().where({ farm_id })
          .first();
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  getAllSupportedCertifications() {
    return async (req, res) => {
      try {
        const result = await certificationModel.query().select('*');
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  getAllSupportedCertifiers() {
    return async (req, res) => {
      try {
        const { farm_id } = req.params;
        const result = await certifierModel.query().select('certifiers.certifier_id', 'certifiers.certification_id', 'certifiers.certifier_name', 'certifiers.certifier_acronym', 'certifiers.survey_id', 'certifier_country.country_id', 'certifier_country.certifier_country_id').from('certifiers').join('certifier_country', 'certifiers.certifier_id', '=', 'certifier_country.certifier_id').join('farm', 'farm.country_id', '=', 'certifier_country.country_id').where('farm.farm_id', farm_id);
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  addOrganicCertifierSurvey() {
    return async (req, res) => {
      try {
        const user_id = req.user.user_id;
        const result = await organicCertifierSurveyModel.query().context({ user_id }).insert(req.body).returning('*');
        res.status(201).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  putOrganicCertifierSurvey() {
    return async (req, res) => {
      try {
        const user_id = req.user.user_id;
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(req.body.survey_id).update(req.body).returning('*');
        return res.status(200).send(result);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  triggerExport() {
    return async (req, res) => {
      // TODO: getting email from request body is commented out for now
      const { farm_id, from_date, to_date, submission_id } = req.body;
      const invalid = [ farm_id, from_date, to_date ].some(property => !property)
      if (invalid) {
        return res.status(400).json({
          message: 'Bad request. Missing properties',
        })
      }
      const organicCertifierSurvey = await knex('organicCertifierSurvey').where({ farm_id }).first();
      const certification = organicCertifierSurvey.certification_id ? await knex('certification')
        .where({ certification_id: organicCertifierSurvey.certification_id }).first() : undefined;
      const certifier = organicCertifierSurvey.certifier_id ? await knex('certifier')
        .where({ certifier_id: organicCertifierSurvey.certifier_id }).first() : undefined;
      const documents = await documentModel.query()
        .withGraphJoined('files')
        .where((builder) => {
          builder.whereBetween('valid_until', [ from_date, to_date ]).orWhere({ no_expiration: true })
        }).andWhere({ farm_id })
      const user_id = req.user.user_id;
      const files = documents.map(({ files, name }) => files.map(({ url, file_name }) => ({
        url, file_name: files.length > 1 ? `${name}-${file_name}` : `${name}.${file_name.split('.').pop()}`,
      }))).reduce((a, b) => a.concat(b), []);
      const { first_name, email } = await userModel.query().where({ user_id }).first();
      const { farm_name } = await farmModel.query().where({ farm_id }).first();
      const data = await this.recordIAndDInfo(to_date, from_date, farm_id)
      const extraInfo = { ...data };
      const body = {
        ...extraInfo, organicCertifierSurvey, certifier, certification,
        files, farm_id, email, first_name, farm_name,
        from_date, to_date, submission: submission_id,
      };
      res.status(200).json({ message: 'Processing', ...extraInfo });
      const retrieveQueue = new Queue('retrieve', redisConf);
      retrieveQueue.add(body, { removeOnComplete: true });
    }
  },

  async recordIAndDInfo(to_date, from_date, farm_id) {
    const recordD = await this.recordDQuery(to_date, from_date, farm_id);
    const recordICrops = await this.recordICropsQuery(to_date, from_date, farm_id);
    const recordICleaners = await this.recordICleanersQuery(to_date, from_date, farm_id);
    return { recordD: recordD.rows, recordICrops, recordICleaners }
  },

  recordDQuery(to_date, from_date, farm_id) {
    return knex.raw(`SELECT cp.crop_variety_name, cp.supplier, cp.organic, cp.searched, cp.treated,
            CASE cp.treated WHEN 'NOT_SURE' then 'NO' ELSE cp.treated END AS treated_doc,
            cp.genetically_engineered
            FROM management_plan mp JOIN crop_variety cp ON mp.crop_variety_id = cp.crop_variety_id 
            JOIN farm f ON cp.farm_id = f.farm_id
            WHERE (mp.complete_date IS NULL OR mp.complete_date > :from_date::date)
            AND (mp.abandon_date IS NULL OR mp.abandon_date > :from_date::date)
            AND mp.start_date IS NOT NULL AND mp.start_date < :to_date::date
            AND cp.organic IS NOT NULL AND cp.farm_id  = :farm_id`, { to_date, from_date, farm_id })
  },

  async recordICropsQuery(to_date, from_date, farm_id) {
    const soilTasks = await knex.raw(`
        SELECT p.name, p.supplier, sat.product_quantity, t.completed_time as date_used, t.task_id,
        p.on_permitted_substances_list
        FROM task t 
        JOIN soil_amendment_task sat ON sat.task_id = t.task_id
        JOIN product p ON p.product_id = sat.product_id 
        JOIN location_tasks tl ON t.task_id = tl.task_id
        JOIN location l ON tl.location_id = l.location_id
        JOIN (
            SELECT location_id FROM field WHERE organic_status != 'Non-Organic' 
            UNION 
            SELECT location_id FROM greenhouse WHERE organic_status != 'Non-Organic'
            UNION 
            SELECT location_id FROM garden WHERE organic_status != 'Non-Organic'
        ) lu ON lu.location_id = l.location_id
        WHERE completed_time::date <= ?::date AND completed_time::date >= ?::date
        AND p.farm_id = ?
    `, [ to_date, from_date, farm_id ]);
    const pestTasks = await this.pestTaskOnCropEnabled(to_date, from_date, farm_id);
    const taskIds = soilTasks.rows.map(({ task_id }) => task_id).concat(pestTasks.rows.map(({ task_id }) => task_id));
    if(!taskIds.length) {
      return [];
    }
    const { managementPlans, locations } = await this.getTasksLocationsAndManagementPlans(taskIds);
    const tasks = pestTasks.rows.concat(soilTasks.rows);
    return tasks.map((task) => {
      return this.filterLocationsAndManagementPlans(task, locations, managementPlans);
    });
  },

  async recordICleanersQuery(to_date, from_date, farm_id) {
    const cleaningTask = await knex.raw(`
        SELECT p.name, p.supplier, ct.product_quantity, t.completed_time as date_used, t.task_id, 
        p.on_permitted_substances_list
        FROM task t 
        JOIN cleaning_task ct ON ct.task_id = t.task_id
        JOIN product p ON p.product_id = ct.product_id 
        WHERE completed_time::date <= ?::date AND completed_time::date >= ?::date
        AND p.farm_id = ?
    `, [ to_date, from_date, farm_id ]);
    const pestTasks = await this.pestTaskOnNonCropEnabled(to_date, from_date, farm_id);
    const taskIds = cleaningTask.rows.map(({ task_id }) => task_id).concat(pestTasks.rows.map(({ task_id }) => task_id));
    if(!taskIds.length) {
      return [];
    }
    const { managementPlans, locations } = await this.getTasksLocationsAndManagementPlans(taskIds);
    const tasks = pestTasks.rows.concat(cleaningTask.rows);
    return tasks.map((task) => {
      return this.filterLocationsAndManagementPlans(task, locations, managementPlans);
    });
  },

  async getTasksLocationsAndManagementPlans(tasks) {
    const locations = await knex('location')
      .distinct('location.location_id')
      .select('name', 'location_tasks.task_id')
      .join('location_tasks', 'location_tasks.location_id', 'location.location_id')
      .whereIn('location_tasks.task_id', tasks);
    const managementPlans = await knex('planting_management_plan')
      .distinct('planting_management_plan.management_plan_id')
      .select('crop_variety_name', 'management_tasks.task_id')
      .join('management_plan', 'planting_management_plan.management_plan_id', 'management_plan.management_plan_id')
      .join('management_tasks', 'management_tasks.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .whereIn('management_tasks.task_id', tasks);
    return { locations, managementPlans };
  },

  filterLocationsAndManagementPlans(task, locations, managementPlans){
    const taskLocations = locations.filter(({ task_id }) => task.task_id === task_id);
    const taskManagementPlans = managementPlans?.filter(({ task_id }) => task.task_id === task_id);
    task.affected = taskLocations.reduce((reducedString, { name }, i) => `${i !== 0 ? ', ' :''}${reducedString} Location: ${name}`, '');
    task.affected += taskManagementPlans.reduce((reducedString, { crop_variety_name }) => `, ${reducedString} Variety: ${crop_variety_name}`, '')
    return task;
  },

  async isCanadianFarm(farm_id) {
    const certifierCountry = await knex.raw(`SELECT * FROM "organicCertifierSurvey" ocs 
            JOIN certifier_country cf ON ocs.certifier_id = cf.certifier_id
            JOIN countries c ON c.id = cf.country_id 
            WHERE country_name = 'Canada' AND farm_id = ?`, [ farm_id ]);
    return certifierCountry.rows.length > 0;
  },

  pestTaskOnCropEnabled(to_date, from_date, farm_id) {
    return knex.raw(`
      SELECT p.name, p.supplier, pct.product_quantity, t.completed_time::date as date_used,
      p.on_permitted_substances_list, t.task_id 
      FROM task t
      JOIN pest_control_task pct ON pct.task_id = t.task_id
      JOIN product p ON p.product_id = pct.product_id 
      JOIN location_tasks tl ON t.task_id = tl.task_id
      JOIN location l ON tl.location_id = l.location_id
      JOIN (
          SELECT location_id FROM field WHERE organic_status != 'Non-Organic' 
          UNION 
          SELECT location_id FROM greenhouse WHERE organic_status != 'Non-Organic'
          UNION 
          SELECT location_id FROM garden WHERE organic_status != 'Non-Organic'
      )  lu ON lu.location_id = l.location_id
      WHERE completed_time::date <= ?::date AND completed_time::date >= ?::date
      AND p.farm_id = ?`, [to_date, from_date, farm_id]);
  },

  pestTaskOnNonCropEnabled(to_date, from_date, farm_id) {
    return knex.raw(`
      SELECT p.name, p.supplier, pct.product_quantity, t.completed_time::date as date_used,
      p.on_permitted_substances_list, t.task_id 
      FROM task t
      JOIN pest_control_task pct ON pct.task_id = t.task_id
      JOIN product p ON p.product_id = pct.product_id 
      JOIN location_tasks tl ON t.task_id = tl.task_id
      JOIN location l ON tl.location_id = l.location_id
      JOIN (
          SELECT location_id FROM buffer_zone
          UNION 
          SELECT location_id FROM water_valve
          UNION 
          SELECT location_id FROM watercourse
          UNION 
          SELECT location_id FROM barn
          UNION 
          SELECT location_id FROM ceremonial_area
          UNION 
          SELECT location_id FROM fence
          UNION 
          SELECT location_id FROM gate
          UNION 
          SELECT location_id FROM natural_area
          UNION 
          SELECT location_id FROM surface_water
          UNION 
          SELECT location_id FROM residence
      )  lu ON lu.location_id = l.location_id
      WHERE completed_time::date <= ?::date AND completed_time::date >= ?::date
      AND p.farm_id = ?`, [to_date, from_date, farm_id]);
  },

  delOrganicCertifierSurvey() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).delete();
        res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

};

module.exports = organicCertifierSurveyController;
