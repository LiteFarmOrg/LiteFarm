/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (farmController.js) is part of LiteFarm.
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
const farmModel = require('../models/farmModel');
const userModel = require('../models/userModel');
const userFarmModel = require('../models/userFarmModel');
const { transaction, Model } = require('objection');

class farmController extends baseController {
  static addFarm() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const result = await baseController.postWithResponse(farmModel, req.body, trx);
        // console.log('farm post result: ', result);
        // update user with new farm
        const new_user = await farmController.getUser(req, trx);
        await farmController.insertUserFarm(new_user[0], result.farm_id, trx);

        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        // console.log('farm post fail: ', error.message);
        //handle more exceptions
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  }

  static getAllFarms() {
    return async (req, res) => {
      try {
        const rows = await baseController.get(farmModel);
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

  static getFarmByID() {
    return async (req, res) => {
      try {

        const id = req.params.farm_id;
        const row = await baseController.getIndividual(farmModel, id);
        if (!row.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(row);
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

  static deleteFarm() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(farmModel, req.params.id, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        }
        else {
          res.sendStatus(404);
        }
      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static updateFarm() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        if(!!req.body.address || !!req.body.grid_points) {
          throw new Error('Not allowed to modify address or gridPoints')
        }
        const updated = await baseController.put(farmModel, req.params.id, req.body, trx);

        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        }
        else {
          res.status(200).send(updated);
        }

      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static async getUser(req, trx){
    // check if a user is making this call
    if (req.user) {

      const uid = req.user.sub.split('|')[1] || req.user.sub.split('@')[0];

      return await userModel.query(trx).where(userModel.idColumn, uid).returning('*');
    }
  }

  static async insertUserFarm(user, farm_id, trx){
    await userFarmModel.query(trx).insert({ user_id: user.user_id, farm_id, role_id: 1, status: 'Active' });
  }
}

module.exports = farmController;
