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
const managementPlanModel = require('../models/managementPlanModel');
const locationModel = require('../models/locationModel');


const documentModel = require('../models/documentModel');
const knex = require('./../util/knex');
const Queue = require('bull');
const { raw } = require('objection');
const redisConf = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
};

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
        const result = await certifierModel.query()
          .select('certifiers.certifier_id', 'certifiers.certification_id', 'certifiers.certifier_name', 'certifiers.certifier_acronym', 'certifiers.survey_id', 'certifier_country.country_id', 'certifier_country.certifier_country_id')
          .from('certifiers')
          .join('certifier_country', 'certifiers.certifier_id', '=', 'certifier_country.certifier_id')
          .join('farm', 'farm.country_id', '=', 'certifier_country.country_id')
          .where('farm.farm_id', farm_id);
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
        const result = await organicCertifierSurveyModel.query()
          .context({ user_id })
          .findById(req.body.survey_id)
          .update(req.body).returning('*');
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
      const invalid = [farm_id, from_date, to_date].some(property => !property);
      if (invalid) {
        return res.status(400).json({
          message: 'Bad request. Missing properties',
        });
      }
      const organicCertifierSurvey = await knex('organicCertifierSurvey').where({ farm_id }).first();
      const certification = organicCertifierSurvey.certification_id ? await knex('certifications')
        .where({ certification_id: organicCertifierSurvey.certification_id }).first() : undefined;
      const certifier = organicCertifierSurvey.certifier_id ? await knex('certifiers')
        .where({ certifier_id: organicCertifierSurvey.certifier_id }).first() : undefined;
      const documents = await documentModel.query()
        .withGraphJoined('files')
        .where((builder) => {
          builder.whereBetween('valid_until', [from_date, to_date]).orWhere({ no_expiration: true });
        }).andWhere({ farm_id });
      const user_id = req.user.user_id;
      const files = documents.map(({ files, name }) => files.map(({ url, file_name }) => ({
        url, file_name: files.length > 1 ? `${name}-${file_name}` : `${name}.${file_name.split('.').pop()}`,
      }))).reduce((a, b) => a.concat(b), []);
      const { first_name, email, language_preference } = await userModel.query().where({ user_id }).first();
      const { farm_name, units: { measurement } } = await farmModel.query().where({ farm_id }).first();
      const data = await this.getRecords(to_date, from_date, farm_id);
      const extraInfo = { ...data };
      const body = {
        ...extraInfo, organicCertifierSurvey, certifier, certification,
        files, farm_id, email, first_name, farm_name, measurement, language_preference,
        from_date, to_date, submission: submission_id,
      };
      res.status(200).json({ message: 'Processing', ...extraInfo });
      const retrieveQueue = new Queue('retrieve', redisConf);
      retrieveQueue.add(body, { removeOnComplete: true });
    };
  },

  async getRecords(to_date, from_date, farm_id) {
    const recordD = await this.recordDQuery(to_date, from_date, farm_id);
    const recordICrops = await this.recordICropsQuery(to_date, from_date, farm_id);
    const recordICleaners = await this.recordICleanersQuery(to_date, from_date, farm_id);
    const recordA = await this.recordAQuery(to_date, from_date, farm_id);
    return { recordD: recordD.rows, recordICrops, recordICleaners, recordA };
  },

  recordDQuery(to_date, from_date, farm_id) {
    return knex.raw(`
      SELECT cp.crop_variety_name, c.crop_translation_key, cp.supplier, cp.organic, cp.searched, cp.treated,
        CASE cp.treated WHEN 'NOT_SURE' then 'NO' ELSE cp.treated END AS treated_doc,
        cp.genetically_engineered
        FROM management_plan mp 
        JOIN crop_variety cp ON mp.crop_variety_id = cp.crop_variety_id 
        JOIN crop c ON cp.crop_id = c.crop_id
        JOIN crop_management_plan cpm ON cpm.management_plan_id = mp.management_plan_id
        JOIN farm f ON cp.farm_id = f.farm_id
        WHERE (mp.complete_date IS NULL OR mp.complete_date > :from_date::date)
        AND ( mp.abandon_date IS NULL OR mp.abandon_date > :from_date::date )
        AND ( mp.start_date IS NULL OR mp.start_date < :to_date::date )
        AND ( mp.start_date IS NOT NULL OR (
            cpm.seed_date < :to_date::date OR
            cpm.plant_date < :to_date::date OR
            cpm.germination_date < :to_date::date OR
            cpm.transplant_date < :to_date::date OR
            cpm.harvest_date < :to_date::date OR
            cpm.termination_date < :to_date::date
        ) )
        AND cp.organic IS NOT NULL AND cp.farm_id  = :farm_id
    `, { to_date, from_date, farm_id });
  },

  async recordICropsQuery(to_date, from_date, farm_id) {
    const soilTasks = await knex.raw(`
        SELECT p.name, p.supplier, sat.product_quantity,
        CASE WHEN t.completed_time is null
          THEN t.due_date
          ELSE t.completed_time
          END as date_used,
        t.task_id,
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
        WHERE 
        ( ( completed_time::date <= :to_date::date AND completed_time::date >= :from_date::date ) OR
        ( due_date::date <= :to_date::date AND due_date::date >= :from_date::date ))
        AND abandoned_time IS NULL
        AND p.farm_id = :farm_id
    `, { to_date, from_date, farm_id });
    const pestTasks = await this.pestTaskOnCropEnabled(to_date, from_date, farm_id);
    const taskIds = soilTasks.rows.map(({ task_id }) => task_id).concat(pestTasks.rows.map(({ task_id }) => task_id));
    if (!taskIds.length) {
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
        SELECT p.name, p.supplier, ct.product_quantity,
        CASE WHEN t.completed_time is null
          THEN t.due_date
          ELSE t.completed_time
          END as date_used,
        t.task_id, 
        p.on_permitted_substances_list
        FROM task t 
        JOIN cleaning_task ct ON ct.task_id = t.task_id
        JOIN product p ON p.product_id = ct.product_id 
        WHERE 
        ( ( completed_time::date <= :to_date::date AND completed_time::date >= :from_date::date ) OR
        ( due_date::date <= :to_date::date AND due_date::date >= :from_date::date ) )
        AND abandoned_time IS NULL
        AND p.farm_id = :farm_id
    `, { to_date, from_date, farm_id });
    const pestTasks = await this.pestTaskOnNonCropEnabled(to_date, from_date, farm_id);
    const taskIds = cleaningTask.rows
      .map(({ task_id }) => task_id)
      .concat(pestTasks.rows.map(({ task_id }) => task_id));
    if (!taskIds.length) {
      return [];
    }
    const { managementPlans, locations } = await this.getTasksLocationsAndManagementPlans(taskIds);
    const tasks = pestTasks.rows.concat(cleaningTask.rows);
    return tasks.map((task) => {
      return this.filterLocationsAndManagementPlans(task, locations, managementPlans);
    });
  },

  async recordAQuery(to_date, from_date, farm_id) {
    const fromDateTime = new Date(from_date).getTime();
    const toDateTime = new Date(to_date).getTime();


    const managementPlans = await managementPlanModel.query().whereNotDeleted()
      .withGraphJoined('[crop_variety.[crop], crop_management_plan.[planting_management_plans.[transplant_task.[task], plant_task.[task]]]]', {
        aliases: {
          crop_management_plan: 'cmp',
          planting_management_plan: 'pmp',
          planting_management_plans: 'pmps',
        },
      })
      .where('crop_variety.farm_id', farm_id)
      .where('management_plan.start_date', '<=', to_date)
      .where(builder => builder.where(builder => builder.whereNull('management_plan.complete_date').whereNull('management_plan.abandon_date'))
        .orWhere(builder => builder.where('management_plan.complete_date', '>', from_date)
          .orWhere('management_plan.abandon_date', '>', from_date)),
      );
    const locationIdCropMap = managementPlans.reduce((locationIdCropMap, managementPlan) => {
      const plantingManagementPlans = managementPlan.crop_management_plan.planting_management_plans;
      for (const plantingManagementPlan of plantingManagementPlans) {
        const location_id = plantingManagementPlan.location_id;
        !locationIdCropMap[location_id] && (locationIdCropMap[location_id] = new Set());
      }
      const hasBeenTransplanted = plantingManagementPlans.filter(plantingManagementPlan => plantingManagementPlan.planting_task_type === 'TRANSPLANT_TASK' && plantingManagementPlan.transplant_task.task.completed_time && new Date(plantingManagementPlan.transplant_task.task.completed_time).getTime() < toDateTime)
        .sort(({ plant_task: { task: { completed_time: firstCompleteTime } } }, { plant_task: { task: { completed_time: secondCompleteTime } } }) => new Date(secondCompleteTime).getTime() - new Date(firstCompleteTime).getTime())
        .find(completedTransplantTask => {
          locationIdCropMap[completedTransplantTask.location_id].add(managementPlan.crop_variety.crop.crop_translation_key);
          return new Date(completedTransplantTask.transplant_task.task.completed_time).getTime() < fromDateTime;
        });

      !hasBeenTransplanted && plantingManagementPlans.find(plantingManagementPlan => {
        if (plantingManagementPlan.planting_task_type === 'PLANT_TASK') {
          const plantTaskCompleteTime = new Date(plantingManagementPlan.plant_task.task.completed_time).getTime();
          if (fromDateTime < plantTaskCompleteTime && plantTaskCompleteTime < toDateTime) {
            locationIdCropMap[plantingManagementPlan.location_id].add(managementPlan.crop_variety.crop.crop_translation_key);
          }
          return true;
        } else if (!plantingManagementPlan.planting_task_type) {
          plantingManagementPlan.location_id && (locationIdCropMap[plantingManagementPlan.location_id].add(managementPlan.crop_variety.crop.crop_translation_key));
          return true;
        }
        return false;
      });

      return locationIdCropMap;
    }, {});

    const locations = await locationModel.query().context({ showHidden: true }).whereNotDeleted()
      .where({ farm_id })
      .withGraphJoined(`[
          figure.[area, line, point], 
          gate, water_valve, field.[organic_history(orderByEffectiveDate)], 
          garden.[organic_history(orderByEffectiveDate)], buffer_zone, watercourse, fence, 
          ceremonial_area, residence, surface_water, natural_area,
          greenhouse.[organic_history(orderByEffectiveDate)], barn, farm_site_boundary
        ]`);

    const booleanTrueToX = bool => bool ? 'x' : '';
    return locations.map(location => {
      const getLocationOrganicStatus = organic_history => {
        if (!organic_history) return undefined;
        let fromDateOrganicStatus = 'Transitional';
        let toDateOrganicStatus;
        for (const organicHistoryStatus of organic_history) {
          const effectiveDateTime = new Date(organicHistoryStatus.effective_date).getTime();
          if (effectiveDateTime <= fromDateTime) {
            fromDateOrganicStatus = organicHistoryStatus.organic_status;
          } else if (effectiveDateTime <= toDateTime) {
            toDateOrganicStatus = organicHistoryStatus.organic_status;
          }
        }
        !toDateOrganicStatus && (toDateOrganicStatus = fromDateOrganicStatus);
        if (fromDateOrganicStatus === toDateOrganicStatus && fromDateOrganicStatus === 'Organic') return 'Organic';
        else if (toDateOrganicStatus === 'Non-Organic') return 'Non-Organic';
        else return 'Transitional';
      };
      const locationOrganicStatus = getLocationOrganicStatus(location[location.figure.type]?.organic_history);
      return ({
        name: location.name,
        crops: Array.from(locationIdCropMap[location.location_id] || []),
        area: location.figure?.area?.total_area || location.figure?.line?.total_area || 0,
        isNew: '',
        isTransitional: booleanTrueToX(locationOrganicStatus === 'Transitional'),
        isOrganic: booleanTrueToX(locationOrganicStatus === 'Organic'),
        isNonOrganic: booleanTrueToX(locationOrganicStatus === 'Non-Organic'),
        isNonProducing: booleanTrueToX(!['field', 'garden', 'greenhouse'].includes(location.figure.type)),
      });
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
      .select('crop_variety_name', 'management_tasks.task_id', 'crop.crop_translation_key')
      .join('management_plan', 'planting_management_plan.management_plan_id', 'management_plan.management_plan_id')
      .join('management_tasks', 'management_tasks.planting_management_plan_id', 'planting_management_plan.planting_management_plan_id')
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .join('crop', 'crop.crop_id', 'crop_variety.crop_id')
      .whereIn('management_tasks.task_id', tasks);
    return { locations, managementPlans };
  },

  filterLocationsAndManagementPlans(task, locations, managementPlans) {
    task.affectedLocations = locations.filter(({ task_id }) => task.task_id === task_id);
    task.affectedManagementPlans = managementPlans?.filter(({ task_id }) => task.task_id === task_id);
    return task;
  },

  async isCanadianFarm(farm_id) {
    const certifierCountry = await knex.raw(`SELECT * FROM "organicCertifierSurvey" ocs 
            JOIN certifier_country cf ON ocs.certifier_id = cf.certifier_id
            JOIN countries c ON c.id = cf.country_id 
            WHERE country_name = 'Canada' AND farm_id = ?`, [farm_id]);
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
      WHERE ( (completed_time::date <= :to_date::date AND completed_time::date >= :from_date::date) OR 
            ( due_date::date <= :to_date::date AND due_date::date >= :from_date::date ) )
      AND p.farm_id = :farm_id`, { to_date, from_date, farm_id });
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
      WHERE (( completed_time::date <= :to_date::date AND completed_time::date >= :from_date::date ) OR
        ( due_date::date <= :to_date::date AND due_date::date >= :from_date::date ) )
      AND p.farm_id = :farm_id`, { to_date, from_date, farm_id });
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
