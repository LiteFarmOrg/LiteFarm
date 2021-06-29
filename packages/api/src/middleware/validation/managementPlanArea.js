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

const locationModel = require('../../models/locationModel');
const cropManagementPlanModel = require('../../models/cropManagementPlanModel');
const plantationMapping = {
  broadcast : (body) => body.crop_management_plan.broadcast.area_used,
}

const validateManagementPlanArea  = (typeOfPlantation) =>  async (req, res, next) => {
  let location;
  if (req.body.crop_management_plan.location_id) {
    location = await locationModel.query()
      .whereNotDeleted().findById(req.body.crop_management_plan.location_id)
      .withGraphJoined('figure.[area, line]');
  } else {
    const managementPlan = await cropManagementPlanModel.query().findById(req.params.management_plan_id)
      .withGraphFetched(`[location.[
          figure.[area, line]]]`);
    location = managementPlan?.location;
  }

  const areaUsed = plantationMapping[typeOfPlantation](req.body);
  if (location?.figure?.area?.total_area && location?.figure?.area?.total_area < areaUsed) {
    return res.status(400).send('Area needed is greater than the field\'s area');
  } else {
    return next();
  }
}

module.exports = validateManagementPlanArea;
