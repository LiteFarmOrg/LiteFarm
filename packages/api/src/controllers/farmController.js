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
const knex = Model.knex();

const farmController = {
  addFarm() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {

        const { country } = req.body;
        if (!country) {
          await trx.rollback();
          return res.status(400).send('No country selected');
        }

        const units = await this.getCountry(country);
        const { country_id } = await this.getCountryID(country);
        if (!units) {
          await trx.rollback();
          return res.status(400).send('No unit info for given country');
        }

        const infoBody = {
          farm_name: req.body.farm_name,
          address: req.body.address,
          grid_points: req.body.grid_points,
          units,
          country_id: country_id,
        }
        const user_id = req.user.user_id;
        const result = await baseController.postWithResponse(farmModel, infoBody, req, { trx });
        // update user with new farm
        const new_user = await farmController.getUser(req, trx);
        const userFarm = await farmController.insertUserFarm(new_user[0], result.farm_id, trx);
        await trx.commit();
        return res.status(201).send(Object.assign({}, result, userFarm));
      } catch (error) {
        //handle more exceptions
        console.log(error);
        await trx.rollback();
        return res.status(400).send(error);
      }
    };
  },

  getAllFarms() {
    return async (req, res) => {
      try {
        const rows = await baseController.get(farmModel);
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

  getFarmByID() {
    return async (req, res) => {
      try {

        const id = req.params.farm_id;
        const row = await baseController.getIndividual(farmModel, id);
        if (!row.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(row);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    };
  },

  deleteFarm() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(farmModel, req.params.farm_id, req, { trx });
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
    };
  },

  updateFarm(mainPatch = false) {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        if ((!!req.body.address || !!req.body.grid_points) && !mainPatch) {
          throw new Error('Not allowed to modify address or gridPoints');
        } else if (req.body.country) {
          req.body.units = await this.getCountry(req.body.country);
          delete req.body.country;
        }
        const user_id = req.user.user_id;
        const updated = await baseController.put(farmModel, req.params.farm_id, req.body, req, { trx });

        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }

      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error: error.message ? error.message : error,
        });
      }
    }
  },

  async getUser(req, trx) {
    // check if a user is making this call
    if (req.user) {

      const uid = req.user.user_id;

      return await userModel.query(trx).where(userModel.idColumn, uid).returning('*');
    }
  },

  async insertUserFarm(user, farm_id, trx) {
    return userFarmModel.query(trx).insert({
      user_id: user.user_id,
      farm_id,
      role_id: 1,
      status: 'Active',
    }).returning('*');
  },

  async getCountry(country) {
    const { iso, unit } = await knex('countries').select('*').where('country_name', country).first();
    return { currency: iso, measurement: unit.toLowerCase() };
  },

  async getCountryID(countryName) {
    const { id } = await knex('countries').select('*').where('country_name', countryName).first();
    return { country_id: id };
  }
}

module.exports = farmController;
