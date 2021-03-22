/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (showedSpotlightController.js) is part of LiteFarm.
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
const showedSpotlightModel = require('../models/showedSpotlightModel');
const { transaction, Model } = require('objection');

const pesticideController = {
  getSpotlightFlags() {
    return async (req, res) => {
      try {
        const { user_id } = req.user;
        const data = await showedSpotlightModel.query().select(
          'map',
          'draw_area',
          'draw_line',
          'drop_point',
          'adjust_area',
          'adjust_line',
        ).findById(user_id);
        res.status(200).send(data);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  },
  updateSpotlightFlags() {
    return async (req, res) => {
      // const trx = await transaction.start(Model.knex());
      // try {
      //   const user_id = req.user.user_id;
      //   const result = await baseController.postWithResponse(pesticideModel, req.body, req, { trx });
      //   await trx.commit();
      //   res.status(201).send(result);
      // } catch (error) {
      //   //handle more exceptions
      //   await trx.rollback();
      //   res.status(400).json({
      //     error,
      //   });
      // }
      return res.status(400).send("not implemented");
    };
  },
}

module.exports = pesticideController;
