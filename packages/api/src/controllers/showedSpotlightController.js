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

const showedSpotlightController = {
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
      const trx = await transaction.start(Model.knex());
      const { user_id } = req.user;
      const {
        map,
        map_end,
        draw_area,
        draw_area_end,
        draw_line,
        draw_line_end,
        drop_point,
        drop_point_end,
        adjust_area,
        adjust_area_end,
        adjust_line,
        adjust_line_end,
      } = req.body;
      try {
        const isPatched = await showedSpotlightModel.query(trx).where('user_id', user_id).patch({
          map,
          map_end,
          draw_area,
          draw_area_end,
          draw_line,
          draw_line_end,
          drop_point,
          drop_point_end,
          adjust_area,
          adjust_area_end,
          adjust_line,
          adjust_line_end,
        });
        if (isPatched) {
          await trx.commit();
          return res.sendStatus(200);
        } else {
          await trx.rollback();
          return res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },
}

module.exports = showedSpotlightController;
