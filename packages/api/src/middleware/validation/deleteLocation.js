/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (authFarmId.js) is part of LiteFarm.
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

import { Model } from 'objection';

import managementPlanModel from '../../models/managementPlanModel';

async function validateLocationDependency(req, res, next) {
  const location_id = req?.params?.location_id;

  const tasks = await Model.knex().raw(
    `
        SELECT DISTINCT lt.task_id,
                        lt.location_id
        FROM location_tasks lt
                 JOIN task t on t.task_id = lt.task_id
        WHERE lt.location_id = :location_id
          AND t.complete_date is null
          AND t.abandon_date is null
        UNION
        SELECT DISTINCT mt.task_id, pmp.location_id
        FROM management_tasks mt
                 JOIN task t on t.task_id = mt.task_id
                 JOIN planting_management_plan pmp on pmp.planting_management_plan_id = mt.planting_management_plan_id
        WHERE pmp.location_id = :location_id
          AND t.complete_date is null
          AND t.abandon_date is null
        UNION
        SELECT DISTINCT pt.task_id, pmp.location_id
        from plant_task pt
                 JOIN task t on t.task_id = pt.task_id
                 JOIN planting_management_plan pmp on pt.planting_management_plan_id = pmp.planting_management_plan_id
        WHERE pmp.location_id = :location_id
          AND t.complete_date is null
          AND t.abandon_date is null
        UNION
        SELECT DISTINCT tt.task_id, pmp.location_id
        from transplant_task tt
                 JOIN task t on t.task_id = tt.task_id
                 JOIN planting_management_plan pmp on tt.planting_management_plan_id = pmp.planting_management_plan_id
        WHERE pmp.location_id = :location_id
          AND t.complete_date is null
          AND t.abandon_date is null
    `,
    { location_id },
  );
  if (tasks.rows.length) {
    return res.status(400).send('Location cannot be deleted when it has incomplete tasks');
  }

  const managementPlans = await managementPlanModel
    .query()
    .whereNotDeleted()
    .withGraphJoined(
      `[crop_variety.[crop], crop_management_plan.[planting_management_plans.[transplant_task.[task], 
      plant_task.[task] ]]]`,
      {
        aliases: {
          crop_management_plan: 'cmp',
          planting_management_plans: 'pmps',
        },
      },
    )
    .where('crop_variety.farm_id', req.headers.farm_id)
    .where('management_plan.complete_date', null)
    .where('management_plan.abandon_date', null);
  //TODO: deprecate req.headers.farm_id and move farm_id to req.context in hasFarmAccess

  for (const {
    crop_management_plan: { planting_management_plans },
  } of managementPlans) {
    let managementPlanLocationId;
    let completeDate;
    for (const plantingManagementPlan of planting_management_plans) {
      if (
        plantingManagementPlan.transplant_task &&
        (plantingManagementPlan.transplant_task.task.complete_date > completeDate || !completeDate)
      ) {
        completeDate = plantingManagementPlan.transplant_task.task.complete_date;
        managementPlanLocationId = plantingManagementPlan.location_id;
      } else if (
        !completeDate &&
        !managementPlanLocationId &&
        (plantingManagementPlan.plant_task ||
          (plantingManagementPlan.plant_task === null &&
            plantingManagementPlan.transplant_task === null)) &&
        plantingManagementPlan.location_id
      ) {
        managementPlanLocationId = plantingManagementPlan.location_id;
      }
    }
    if (managementPlanLocationId === location_id) {
      return res.status(400).send('Location cannot be deleted when it has a managementPlan');
    }
  }

  return next();
}

export default validateLocationDependency;
