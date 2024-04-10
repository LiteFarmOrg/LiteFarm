/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
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

import OrganicCertifierSurveyModel from '../models/organicCertifierSurveyModel.js';

import CertificationModel from '../models/certificationModel.js';
import CertifierModel from '../models/certifierModel.js';
import UserModel from '../models/userModel.js';
import FarmModel from '../models/farmModel.js';
import ManagementPlanModel from '../models/managementPlanModel.js';
import LocationModel from '../models/locationModel.js';
import DocumentModel from '../models/documentModel.js';
import Queue from 'bull';
import { v4 as uuidv4 } from 'uuid';
import knex from '../util/knex.js';
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
        const result = await OrganicCertifierSurveyModel.query()
          .whereNotDeleted()
          .where({ farm_id })
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
        const result = await CertificationModel.query().select('*');
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
        const result = await CertifierModel.query()
          .select(
            'certifiers.certifier_id',
            'certifiers.certification_id',
            'certifiers.certifier_name',
            'certifiers.certifier_acronym',
            'certifiers.survey_id',
            'certifier_country.country_id',
            'certifier_country.certifier_country_id',
          )
          .from('certifiers')
          .join(
            'certifier_country',
            'certifiers.certifier_id',
            '=',
            'certifier_country.certifier_id',
          )
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
        const user_id = req.auth.user_id;
        const result = await OrganicCertifierSurveyModel.query()
          .context({ user_id })
          .insert(req.body)
          .returning('*');
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
        const user_id = req.auth.user_id;
        const result = await OrganicCertifierSurveyModel.query()
          .context({ user_id })
          .findById(req.body.survey_id)
          .update(req.body)
          .returning('*');
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
      const invalid = [farm_id, from_date, to_date].some((property) => !property);
      if (invalid) {
        return res.status(400).json({
          message: 'Bad request. Missing properties',
        });
      }
      const organicCertifierSurvey = await knex('organicCertifierSurvey')
        .where({ farm_id, interested: true })
        .first();

      // Skip the whole flow in case this Farm is not pursuing any cert.
      if (organicCertifierSurvey === undefined) {
        return res
          .status(400)
          .json({ message: 'You are not currently pursuing any certifications.' });
      }

      const certification = organicCertifierSurvey.certification_id
        ? await knex('certifications')
            .where({ certification_id: organicCertifierSurvey.certification_id })
            .first()
        : undefined;
      const certifier = organicCertifierSurvey.certifier_id
        ? await knex('certifiers')
            .where({ certifier_id: organicCertifierSurvey.certifier_id })
            .first()
        : undefined;
      const documents = await DocumentModel.query()
        .withGraphJoined('files')
        .where((builder) => {
          builder.where('valid_until', '>=', from_date).orWhere({ no_expiration: true });
        })
        .where({ archived: false })
        .andWhere({ farm_id });
      const user_id = req.auth.user_id;
      const files = documents
        .map(({ files, name }) =>
          files.map(({ url, file_name }) => ({
            url,
            file_name:
              files.length > 1 ? `${name}-${file_name}` : `${name}.${file_name.split('.').pop()}`,
          })),
        )
        .reduce((a, b) => a.concat(b), []);
      const { first_name, email, language_preference } = await UserModel.query()
        .where({ user_id })
        .first();
      const {
        farm_name,
        units: { measurement },
      } = await FarmModel.query().where({ farm_id }).first();
      const data = await this.getRecords(to_date, from_date, farm_id);
      const extraInfo = { ...data };
      const body = {
        exportId: uuidv4(),
        ...extraInfo,
        organicCertifierSurvey,
        certifier,
        certification,
        files,
        farm_id,
        email,
        first_name,
        farm_name,
        measurement,
        language_preference,
        from_date,
        to_date,
        submission: submission_id,
      };
      res.status(200).json({ message: 'Processing', ...extraInfo });
      const retrieveQueue = new Queue('retrieve', redisConf);
      retrieveQueue.add(body, { removeOnComplete: true });
    };
  },

  async getRecords(to_date, from_date, farm_id) {
    const activeManagementPlans = await this.getActiveManagementPlans(to_date, from_date, farm_id);
    const recordD = await this.recordDQuery(to_date, from_date, farm_id, activeManagementPlans);
    const recordICrops = await this.recordICropsQuery(to_date, from_date, farm_id);
    const recordICleaners = await this.recordICleanersQuery(to_date, from_date, farm_id);
    const recordA = await this.recordAQuery(to_date, from_date, farm_id, activeManagementPlans);
    return { recordD: recordD.rows, recordICrops, recordICleaners, recordA };
  },

  recordDQuery(to_date, from_date, farm_id, activeManagementPlans) {
    const managementPlanIds = activeManagementPlans.map(
      ({ management_plan_id }) => management_plan_id,
    );
    return knex.raw(
      `
          SELECT cp.crop_variety_name,
                 c.crop_translation_key,
                 cp.supplier,
                 cp.organic,
                 cp.searched,
                 cp.treated,
                 CASE cp.treated WHEN 'NOT_SURE' then 'NO' ELSE cp.treated END AS treated_doc,
                 cp.genetically_engineered
          FROM management_plan mp
                   JOIN crop_variety cp ON mp.crop_variety_id = cp.crop_variety_id
                   JOIN crop c ON cp.crop_id = c.crop_id
                   JOIN crop_management_plan cpm ON cpm.management_plan_id = mp.management_plan_id
                   JOIN farm f ON cp.farm_id = f.farm_id
          WHERE mp.management_plan_id = any (:managementPlanIds)
            AND cp.organic IS NOT NULL
            AND cp.farm_id = :farm_id
      `,
      { to_date, from_date, farm_id, managementPlanIds },
    );
  },

  async recordICropsQuery(to_date, from_date, farm_id) {
    const soilTasks = await knex.raw(
      `
          SELECT DISTINCT p.name,
                          p.supplier,
                          sat.product_quantity,
                          CASE
                              WHEN t.complete_date is null
                                  THEN t.due_date
                              ELSE t.complete_date
                              END as date_used,
                          t.task_id,
                          p.on_permitted_substances_list
          FROM task t
                   JOIN soil_amendment_task sat ON sat.task_id = t.task_id
                   JOIN product p ON p.product_id = sat.product_id
                   JOIN location_tasks tl ON t.task_id = tl.task_id
                   JOIN location l ON tl.location_id = l.location_id
                   JOIN (SELECT location_id
                         FROM field
                         WHERE organic_status != 'Non-Organic'
                         UNION
                         SELECT location_id
                         FROM greenhouse
                         WHERE organic_status != 'Non-Organic'
                         UNION
                         SELECT location_id
                         FROM garden
                         WHERE organic_status != 'Non-Organic') lu ON lu.location_id = l.location_id
          WHERE ((complete_date::date <= :to_date::date AND complete_date::date >= :from_date::date) OR
                 (due_date::date <= :to_date::date AND due_date::date >= :from_date::date))
            AND abandon_date IS NULL
            AND p.farm_id = :farm_id
            AND t.deleted = false
      `,
      { to_date, from_date, farm_id },
    );
    const pestTasks = await this.pestTaskOnCropEnabled(to_date, from_date, farm_id);
    const taskIds = soilTasks.rows
      .map(({ task_id }) => task_id)
      .concat(pestTasks.rows.map(({ task_id }) => task_id));
    if (!taskIds.length) {
      return [];
    }
    const {
      managementPlans,
      locations,
      pinCoordinates,
    } = await this.getTasksLocationsAndManagementPlans(taskIds);
    const tasks = pestTasks.rows.concat(soilTasks.rows);
    return tasks.map((task) => {
      return this.filterLocationsAndManagementPlans(
        task,
        locations,
        managementPlans,
        pinCoordinates,
      );
    });
  },

  async recordICleanersQuery(to_date, from_date, farm_id) {
    const cleaningTask = await knex.raw(
      `
          SELECT p.name,
                 p.supplier,
                 ct.product_quantity,
                 CASE
                     WHEN t.complete_date is null
                         THEN t.due_date
                     ELSE t.complete_date
                     END as date_used,
                 t.task_id,
                 p.on_permitted_substances_list
          FROM task t
                   JOIN cleaning_task ct ON ct.task_id = t.task_id
                   JOIN product p ON p.product_id = ct.product_id
          WHERE ((complete_date::date <= :to_date::date AND complete_date::date >= :from_date::date) OR
                 (due_date::date <= :to_date::date AND due_date::date >= :from_date::date))
            AND abandon_date IS NULL
            AND p.farm_id = :farm_id
            AND t.deleted = false
      `,
      { to_date, from_date, farm_id },
    );
    const pestTasks = await this.pestTaskOnNonCropEnabled(to_date, from_date, farm_id);
    const taskIds = cleaningTask.rows
      .map(({ task_id }) => task_id)
      .concat(pestTasks.rows.map(({ task_id }) => task_id));
    if (!taskIds.length) {
      return [];
    }
    const {
      managementPlans,
      locations,
      pinCoordinates,
    } = await this.getTasksLocationsAndManagementPlans(taskIds);
    const tasks = pestTasks.rows.concat(cleaningTask.rows);
    return tasks.map((task) => {
      return this.filterLocationsAndManagementPlans(
        task,
        locations,
        managementPlans,
        pinCoordinates,
      );
    });
  },

  async recordAQuery(to_date, from_date, farm_id, activeManagementPlans) {
    const startOfFromDate = new Date(`${from_date}T00:00:00`);
    const endOfEndDate = new Date(`${to_date}T23:59:59`);

    const wildCropRecords = activeManagementPlans.reduce((wildCropRecords, managementPlan) => {
      const plantingManagementPlans = managementPlan.crop_management_plan.planting_management_plans;
      for (const plantingManagementPlan of plantingManagementPlans) {
        if (plantingManagementPlan.pin_coordinate) {
          const { lat, lng } = plantingManagementPlan.pin_coordinate;
          wildCropRecords.push({
            name: `${lat}, ${lng}`,
            crops: [managementPlan.crop_variety.crop.crop_translation_key],
            area: null,
            isNew: '',
            isTransitional: '',
            isOrganic: '',
            isNonOrganic: '',
            isNonProducing: '',
          });
        }
      }
      return wildCropRecords;
    }, []);

    const locationIdCropMap = activeManagementPlans.reduce((locationIdCropMap, managementPlan) => {
      const plantingManagementPlans = managementPlan.crop_management_plan.planting_management_plans;
      for (const plantingManagementPlan of plantingManagementPlans) {
        const location_id = plantingManagementPlan.location_id;
        !locationIdCropMap[location_id] && (locationIdCropMap[location_id] = new Set());
      }
      /**
       * https://lucid.app/lucidchart/482f5f34-1ff7-4166-a1c4-7c23560fe7b5/edit?invitationId=inv_f1389038-4f0a-4b67-a826-adc754bfeb9f
       * hasBeenTransplanted = plantingManagementPlans.filter()
       */
      plantingManagementPlans
        .filter((plantingManagementPlan) => {
          if (plantingManagementPlan?.transplant_task?.task?.abandon_date) return false;
          const transplantTaskDate =
            plantingManagementPlan?.transplant_task?.task?.complete_date ||
            plantingManagementPlan.transplant_task?.task?.due_date;
          if (!transplantTaskDate) return true;
          return transplantTaskDate <= endOfEndDate;
        })
        //TODO: sort in db query
        .sort((task1, task2) => {
          if (!task1.transplant_task) return 1;
          if (!task2.transplant_task) return -1;
          const {
            transplant_task: {
              task: { complete_date: firstCompleteTime, due_date: firstDueDate },
            },
          } = task1;
          const {
            transplant_task: {
              task: { complete_date: secondCompleteTime, due_date: secondDueDate },
            },
          } = task2;
          return (
            (secondCompleteTime || secondDueDate).getTime() -
            (firstCompleteTime || firstDueDate).getTime()
          );
        })
        .find((plantingManagementPlan) => {
          locationIdCropMap[plantingManagementPlan.location_id].add(
            managementPlan.crop_variety.crop.crop_translation_key,
          );
          const transplantTaskDate =
            plantingManagementPlan?.transplant_task?.task?.complete_date ||
            plantingManagementPlan.transplant_task?.task?.due_date;
          return transplantTaskDate && transplantTaskDate < startOfFromDate;
        });

      return locationIdCropMap;
    }, {});

    const locations = await LocationModel.query()
      .context({ showHidden: true })
      .whereNotDeleted()
      .where({ farm_id }).withGraphFetched(`[
          figure.[area, line, point], 
          gate, water_valve, field.[organic_history(orderByEffectiveDateAsc)], 
          garden.[organic_history(orderByEffectiveDateAsc)], buffer_zone, watercourse, fence, 
          ceremonial_area, residence, surface_water, natural_area,
          greenhouse.[organic_history(orderByEffectiveDateAsc)], barn, farm_site_boundary
        ]`);

    const booleanTrueToX = (bool) => (bool ? 'x' : '');
    const startOfToDate = new Date(`${to_date}T00:00:00.000`);
    startOfToDate.setHours(0, 0, 0, 0);
    const excludedLocationTypes = new Set([
      'farm_site_boundary',
      'gate',
      'water_valve',
      'fence',
      'watercourse',
      'surface_water',
    ]);
    const cropEnabledAreaTypes = new Set(['field', 'garden', 'greenhouse']);
    const locationRecords = locations
      .filter(({ figure: { type } }) => !excludedLocationTypes.has(type))
      .map((location) => {
        const getLocationOrganicStatus = (location) => {
          if (location.buffer_zone) {
            return 'Non-Organic';
          }
          if (!cropEnabledAreaTypes.has(location?.figure?.type)) return 'Non-Producing';
          const organic_history = location[location.figure.type]?.organic_history;
          if (
            !organic_history ||
            !organic_history.length ||
            organic_history[0].effective_date > startOfToDate
          )
            return undefined;
          let isOrganic;
          let isNonOrganic;

          for (const { effective_date, organic_status } of organic_history) {
            if (effective_date <= startOfFromDate) {
              isOrganic = organic_status === 'Organic';
              isNonOrganic = organic_status === 'Non-Organic';
            } else if (effective_date <= startOfToDate) {
              if (organic_status === 'Non-Organic' || isNonOrganic) {
                return 'Non-Organic';
              } else if (organic_status !== 'Organic') {
                isOrganic = false;
              }
            }
          }
          return isNonOrganic ? 'Non-Organic' : isOrganic ? 'Organic' : 'Transitional';
        };

        const crops = Array.from(locationIdCropMap[location.location_id] || []);
        const locationOrganicStatus = getLocationOrganicStatus(location);

        return {
          location_id: location.location_id,
          name: location.name,
          crops,
          area: location.figure?.area?.total_area || location.figure?.line?.total_area || 0,
          isNew: '',
          isTransitional: booleanTrueToX(locationOrganicStatus === 'Transitional'),
          isOrganic: booleanTrueToX(locationOrganicStatus === 'Organic'),
          isNonOrganic: booleanTrueToX(locationOrganicStatus === 'Non-Organic'),
          isNonProducing: booleanTrueToX(locationOrganicStatus === 'Non-Producing'),
        };
      });
    return [...locationRecords, ...wildCropRecords];
  },

  async getActiveManagementPlans(to_date, from_date, farm_id) {
    const startOfFromDate = new Date(`${from_date}T00:00:00`);
    const endOfEndDate = new Date(`${to_date}T23:59:59`);
    const managementPlans = await ManagementPlanModel.query()
      .whereNotDeleted()
      .withGraphJoined(
        '[crop_variety.[crop], crop_management_plan.[planting_management_plans.[transplant_task.[task], plant_task.[task], managementTasks.[task]]]]',
        {
          aliases: {
            crop_management_plan: 'cmp',
            planting_management_plan: 'pmp',
            planting_management_plans: 'pmps',
          },
        },
      )
      .where('crop_variety.farm_id', farm_id)
      .whereRaw(
        '((management_plan.complete_date IS NULL and management_plan.abandon_date IS NULL) OR management_plan.complete_date > ?)',
        [from_date],
      );
    return managementPlans.filter(({ crop_management_plan: { planting_management_plans } }) => {
      for (const planting_management_plan of planting_management_plans) {
        const tasks = planting_management_plan.managementTasks.map(({ task }) => task);
        if (planting_management_plan.plant_task)
          tasks.push(planting_management_plan.plant_task.task);
        if (planting_management_plan.transplant_task)
          tasks.push(planting_management_plan.transplant_task.task);

        const nonAbandonedTasks = tasks.filter((task) => !task.abandon_date);
        let hasTasksBeforeReportingPeriod;
        let hasTasksAfterReportingPeriod;
        for (const task of nonAbandonedTasks) {
          const taskDate = task?.complete_date || task.due_date;
          if (taskDate >= startOfFromDate && taskDate <= endOfEndDate) return true;
          if (taskDate < startOfFromDate) hasTasksBeforeReportingPeriod = true;
          if (taskDate > endOfEndDate) hasTasksAfterReportingPeriod = true;
          if (hasTasksBeforeReportingPeriod && hasTasksAfterReportingPeriod) return true;
        }
      }
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
      .join(
        'management_plan',
        'planting_management_plan.management_plan_id',
        'management_plan.management_plan_id',
      )
      .join(
        'management_tasks',
        'management_tasks.planting_management_plan_id',
        'planting_management_plan.planting_management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .join('crop', 'crop.crop_id', 'crop_variety.crop_id')
      .whereIn('management_tasks.task_id', tasks);
    const pinCoordinates = await knex('planting_management_plan')
      .distinct('planting_management_plan.pin_coordinate')
      .select('planting_management_plan.pin_coordinate', 'management_tasks.task_id')
      .join(
        'management_plan',
        'planting_management_plan.management_plan_id',
        'management_plan.management_plan_id',
      )
      .join(
        'management_tasks',
        'management_tasks.planting_management_plan_id',
        'planting_management_plan.planting_management_plan_id',
      )
      .join('crop_variety', 'crop_variety.crop_variety_id', 'management_plan.crop_variety_id')
      .join('crop', 'crop.crop_id', 'crop_variety.crop_id')
      .whereIn('management_tasks.task_id', tasks)
      .whereNotNull('planting_management_plan.pin_coordinate');
    return { locations, managementPlans, pinCoordinates };
  },

  filterLocationsAndManagementPlans(task, locations, managementPlans, pinCoordinates) {
    task.affectedLocations = locations.filter(({ task_id }) => task.task_id === task_id);
    task.affectedCoordinates = pinCoordinates.filter(({ task_id }) => task.task_id === task_id);
    task.affectedManagementPlans = managementPlans?.filter(
      ({ task_id }) => task.task_id === task_id,
    );
    return task;
  },

  async isCanadianFarm(farm_id) {
    const certifierCountry = await knex.raw(
      `SELECT *
       FROM "organicCertifierSurvey" ocs
                JOIN certifier_country cf ON ocs.certifier_id = cf.certifier_id
                JOIN countries c ON c.id = cf.country_id
       WHERE country_name = 'Canada'
         AND farm_id = ?`,
      [farm_id],
    );
    return certifierCountry.rows.length > 0;
  },

  pestTaskOnCropEnabled(to_date, from_date, farm_id) {
    return knex.raw(
      `
          SELECT DISTINCT p.name,
                          p.supplier,
                          pct.product_quantity,
                          t.complete_date::date as date_used, CASE
                                                                  WHEN t.complete_date is null
                                                                      THEN t.due_date
                                                                  ELSE t.complete_date
              END as date_used,
                          p.on_permitted_substances_list,
                          t.task_id
          FROM task t
                   JOIN pest_control_task pct ON pct.task_id = t.task_id
                   JOIN product p ON p.product_id = pct.product_id
                   JOIN location_tasks tl ON t.task_id = tl.task_id
                   JOIN location l ON tl.location_id = l.location_id
                   JOIN (SELECT location_id
                         FROM field
                         WHERE organic_status != 'Non-Organic'
                         UNION
                         SELECT location_id
                         FROM greenhouse
                         WHERE organic_status != 'Non-Organic'
                         UNION
                         SELECT location_id
                         FROM garden
                         WHERE organic_status != 'Non-Organic') lu ON lu.location_id = l.location_id
          WHERE ((complete_date::date <= :to_date::date AND complete_date::date >= :from_date::date) OR
                 (due_date::date <= :to_date::date AND due_date::date >= :from_date::date))
            AND p.farm_id = :farm_id
            AND t.deleted = false
      `,
      { to_date, from_date, farm_id },
    );
  },

  pestTaskOnNonCropEnabled(to_date, from_date, farm_id) {
    return knex.raw(
      `
          SELECT DISTINCT p.name,
                          p.supplier,
                          pct.product_quantity,
                          CASE
                              WHEN t.complete_date is null
                                  THEN t.due_date
                              ELSE t.complete_date
                              END as date_used,
                          p.on_permitted_substances_list,
                          t.task_id
          FROM task t
                   JOIN pest_control_task pct ON pct.task_id = t.task_id
                   JOIN product p ON p.product_id = pct.product_id
                   JOIN location_tasks tl ON t.task_id = tl.task_id
                   JOIN location l ON tl.location_id = l.location_id
                   JOIN (SELECT location_id
                         FROM buffer_zone
                         UNION
                         SELECT location_id
                         FROM water_valve
                         UNION
                         SELECT location_id
                         FROM watercourse
                         UNION
                         SELECT location_id
                         FROM barn
                         UNION
                         SELECT location_id
                         FROM ceremonial_area
                         UNION
                         SELECT location_id
                         FROM fence
                         UNION
                         SELECT location_id
                         FROM gate
                         UNION
                         SELECT location_id
                         FROM natural_area
                         UNION
                         SELECT location_id
                         FROM surface_water
                         UNION
                         SELECT location_id
                         FROM residence) lu ON lu.location_id = l.location_id
          WHERE ((complete_date::date <= :to_date::date AND complete_date::date >= :from_date::date) OR
                 (due_date::date <= :to_date::date AND due_date::date >= :from_date::date))
            AND p.farm_id = :farm_id
            AND t.deleted = false
      `,
      { to_date, from_date, farm_id },
    );
  },

  delOrganicCertifierSurvey() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.auth.user_id;
        await OrganicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).delete();
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

export default organicCertifierSurveyController;
