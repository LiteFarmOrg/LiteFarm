/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (logController.js) is part of LiteFarm.
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

import { transaction } from 'objection';
import { Model } from 'objection';
import HarvestUseTypeModel from '../models/harvestUseTypeModel.js';

const logController = {
  getHarvestUseTypesByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await HarvestUseTypeModel.query().where('farm_id', null).orWhere({ farm_id });
        if (!rows.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(rows);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  addHarvestUseType() {
    return async (req, res) => {
      const { farm_id } = req.headers;
      const { name } = req.body;
      const trx = await transaction.start(Model.knex());
      try {
        const check = await HarvestUseTypeModel.query()
          .where((builder) => builder.where('farm_id', farm_id).orWhere('farm_id', null))
          .where('harvest_use_type_name', name)
          .first();
        if (check) {
          await trx.rollback();
          return res.status(400).send('Cannot make duplicate type for this farm');
        }
        const harvest_use_type = {
          farm_id,
          harvest_use_type_name: name,
          harvest_use_type_translation_key: name,
        };
        const result = await baseController.post(HarvestUseTypeModel, harvest_use_type, req, {
          trx,
        });
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
};

export default logController;
