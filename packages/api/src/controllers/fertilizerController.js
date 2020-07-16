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
const FertilizerModel = require('../models/fertilizerModel');
const { transaction, Model } = require('objection');

class fertilizerController extends baseController {
  static getFertilizers() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await FertilizerModel.query().where('farm_id', null).orWhere('farm_id', farm_id);
        if (!rows.length) {
          res.sendStatus(404)
        }
        else {
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
        // another check for farm_id after ACL
        if(farm_id !== body_farm_id){
          res.status(400).send({ error: 'farm_id does not match in params and body' });
        }
        const result = await baseController.postWithResponse(FertilizerModel, req.body, trx);
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
}

module.exports = fertilizerController;
