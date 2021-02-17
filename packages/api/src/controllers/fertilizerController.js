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

const baseController = require('../controllers/baseController');
const fertilizerModel = require('../models/fertilizerModel');
const { transaction, Model } = require('objection');

class fertilizerController {
  static getFertilizers() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await fertilizerModel.query().context({ user_id: req.user.user_id }).whereNotDeleted().where('farm_id', null).orWhere({
          farm_id,
          deleted: false,
        });
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }
  static addFertilizer(){
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const farm_id = req.params.farm_id;
        const body_farm_id = req.body.farm_id;
        const data = req.body;
        data.fertilizer_translation_key = data.fertilizer_type;
        // another check for farm_id after ACL
        if(farm_id !== body_farm_id){
          res.status(400).send({ error: 'farm_id does not match in params and body' });
        }
        const user_id = req.user.user_id
        const result = await baseController.postWithResponse(fertilizerModel, data, trx, { user_id });
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static delFertilizer() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(fertilizerModel, req.params.fertilizer_id, trx, { user_id: req.user.user_id });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }
}

module.exports = fertilizerController;
