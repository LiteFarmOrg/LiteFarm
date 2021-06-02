/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (ManagementPlanController.js) is part of LiteFarm.
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
const managementPlanModel = require('../models/managementPlanModel');
const { transaction, Model, raw } = require('objection');
const knex = Model.knex();

const managementPlanController = {
  addManagementPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(managementPlanModel, req.body, req, { trx });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        console.log(error);
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  delManagementPlan() {
    return async (req, res) => {

      try {
        const isDeleted = await managementPlanModel.query().context(req.user).where({ management_plan_id: req.params.management_plan_id }).delete();

        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  updateManagementPlan() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(managementPlanModel, req.params.management_plan_id, req.body, req, { trx });
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      } catch (error) {
        console.log(error);
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlanByID() {
    return async (req, res) => {
      try {
        const management_plan_id = req.params.management_plan_id;
        const managementPlan = await managementPlanModel.query().whereNotDeleted().findById(management_plan_id)
          .withGraphFetched(planGraphFetchedQueryString);
        return managementPlan ? res.status(200).send(removeLocationFromManagementPlan(managementPlan)) : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlanByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString)
          .where('crop_management_plan:location.farm_id', farm_id);
        return managementPlans?.length ? res.status(200).send(removeLocationFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },

  getManagementPlansByDate() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const date = req.params.date;
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString)
          .where('crop_management_plan:location.farm_id', farm_id)
          .andWhere('harvest_date', '>=', date);


        return managementPlans?.length ? res.status(200).send(removeLocationFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
      } catch (error) {
        console.log(error);
        res.status(400).json({ error });
      }
    };
  },

  getExpiredManagementPlans() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const managementPlans = await managementPlanModel.query().whereNotDeleted()
          .withGraphJoined(planGraphFetchedQueryString)
          .where('crop_management_plan:location.farm_id', farm_id)
          .andWhere(raw('harvest_date < now()'));
        return managementPlans?.length ? res.status(200).send(removeLocationFromManagementPlans(managementPlans)) : res.status(404).send('Field crop not found');
      } catch (error) {
        res.status(400).json({ error });
      }
    };
  },
};

const planGraphFetchedQueryString = '[crop_management_plan.[beds, container, broadcast, location], transplant_container]';

const removeLocationFromManagementPlan = (managementPlan) => {
  !managementPlan.transplant_container && delete managementPlan.transplant_container;
  delete managementPlan.crop_management_plan.location;
  for (const plantingType of ['container', 'beds', 'rows', 'broadcast']) {
    !managementPlan.crop_management_plan[plantingType] && delete managementPlan.crop_management_plan[plantingType];
  }
  return managementPlan;
};

const removeLocationFromManagementPlans = (managementPlans) => {
  for (let i = 0; i < managementPlans.length; i++) removeLocationFromManagementPlan(managementPlans[i]);
  return managementPlans;
};

module.exports = managementPlanController;
