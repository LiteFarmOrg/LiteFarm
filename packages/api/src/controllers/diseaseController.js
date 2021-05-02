/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (diseaseController.js) is part of LiteFarm.
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
const diseaseModel = require('../models/diseaseModel');
const { transaction, Model } = require('objection');

const diseaseController = {

  getDisease() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await diseaseController.get(farm_id);
        res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },
  addDisease() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const user_id = req.user.user_id;
        const data = req.body;
        data.disease_name_translation_key = data.disease_common_name;
        data.disease_group_translation_key = data.disease_group;
        const result = await baseController.postWithResponse(diseaseModel, data, req, { trx });
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
  },

  delDisease() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(diseaseModel, req.params.disease_id, req, { trx });
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  },

  async get(farm_id) {
    //return await baseController.get(FertilizerModel);
    return await diseaseModel.query().whereNotDeleted().where('farm_id', null).orWhere({ farm_id, deleted: false });
  },
};

module.exports = diseaseController;
