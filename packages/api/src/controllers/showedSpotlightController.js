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

import baseController from '../controllers/baseController.js';

import ShowedSpotlightModel from '../models/showedSpotlightModel.js';

const showedSpotlightController = {
  getSpotlightFlags() {
    return async (req, res) => {
      try {
        const { user_id } = req.auth;
        const data = await ShowedSpotlightModel.query()
          .select(
            'map',
            'draw_area',
            'draw_line',
            'drop_point',
            'adjust_area',
            'adjust_line',
            'navigation',
            'notification',
            'introduce_map',
            'crop_catalog',
            'crop_variety_detail',
            'documents',
            'compliance_docs_and_certification',
            'transplant',
            'management_plan_creation',
            'sensor_reading_chart',
            'repeat_management_plan_creation',
          )
          .findById(user_id);
        res.status(200).send(data);
        console.log(data);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },
  updateSpotlightFlags() {
    return async (req, res) => {
      const { user_id } = req.auth;
      try {
        const isPatched = await baseController.updateIndividualById(
          ShowedSpotlightModel,
          user_id,
          req.body,
          req,
        );
        if (isPatched) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(404);
        }
      } catch (error) {
        return res.status(400).send(error);
      }
    };
  },
};

export default showedSpotlightController;
