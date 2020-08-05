/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userController.js) is part of LiteFarm.
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
const userModel = require('../models/userModel');
const userFarmModel = require('../models/userFarmModel');
//const roleModel = require('../models/roleModel');
const { transaction, Model } = require('objection');
const auth0Config = require('../auth0Config');
const axios = require('axios');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);
const emailSender = require('../templates/sendEmailTemplate');


class userController extends baseController {
  static addUser() {
    // Add user endpoint
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        await baseController.post(userModel, req.body, trx);
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        // handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static addPseudoUser() {
    // Add pseudo user endpoint
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const {
          user_id,
          farm_id,
          first_name,
          last_name,
          wage,
          email,
        } = req.body;
        const {
          type: wageType,
          amount: wageAmount,
        } = wage || {};

        /* Start of input validation */
        const requiredProps = {
          user_id,
          farm_id,
          first_name,
          last_name,
          email,
        };

        if (Object.keys(requiredProps).some(key => !requiredProps[key])) {
          const errorMessageTitle = 'Missing Properties: ';
          const errorMessage = Object.keys(requiredProps).reduce((missingPropMsg, key) => {
            if (!requiredProps[key]) {
              const concatMsg = [missingPropMsg, key];
              return missingPropMsg === errorMessageTitle
                ? concatMsg.join('') // to avoid prepending first item in list with comma
                : concatMsg.join(', ');
            }
            return missingPropMsg;
          }, errorMessageTitle);
          return res.status(400).send(errorMessage);
        }

        if (email !== `${user_id}@pseudo.com`) {
          return res.status(400).send('Invalid pseudo user email');
        }

        const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);
        if (wage && wageAmount && !validWageRegex.test(wageAmount)) {
          return res.status(400).send('Invalid wage amount');
        }

        if (wage && wageType && wageType.toLowerCase() !== 'hourly') {
          return res.status(400).send('Current app version only allows hourly wage');
        }
        /* End of input validation */

        await baseController.post(userModel, req.body, trx);
        await userFarmModel.query(trx).insert({
          user_id,
          farm_id,
          status: 'Active',
          consent_version: '1.0',
          role_id: 4,
          wage,
        });
        await trx.commit();
        res.sendStatus(201);
      } catch (error) {
        // handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static getUserByID() {
    return async (req, res) => {
      try {
        const id = req.params.id;

        const data = await knex.raw(
          `
          SELECT uf.user_id, uf.farm_id, uf.role_id, uf.has_consent, u.created_at, u.first_name, u.last_name, u.profile_picture, u.email, u.phone_number,
          uf.status, uf.consent_version, uf.wage
          FROM "users" u
          LEFT JOIN
          "userFarm" uf
          ON uf.user_id = u.user_id
          WHERE u.user_id = '${id}'
          `
        );

        if (!data && !data.rows) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(data.rows);
        }
      }
      catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).send(error);
      }
    }
  }

  static getUserByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const userFarm = await knex.raw(`
          SELECT
            uf.user_id,
            first_name,
            last_name,
            profile_picture,
            phone_number,
            address,
            notification_setting,
            role,
            uf.has_consent,
            status,
            uf.consent_version,
            r.role_id,
            uf.wage,
          CASE
            WHEN r.role_id = 4 THEN ''
            ELSE email END
          FROM "userFarm" uf, "role" r, "users" u
          WHERE uf.farm_id='${farm_id}'
            AND uf.user_id=u.user_id
            AND uf.role_id=r.role_id
        `);
        const { rows } = userFarm;
        if (!rows || rows.length === 0) {
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

  static getActiveUserByFarmID() {
    // TODO: convert this into get all users by farm id and let front end handle which type of users to display
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const userFarm = await knex.raw(`
          SELECT
            uf.user_id,
            first_name,
            last_name,
            profile_picture,
            email,
            phone_number,
            address,
            notification_setting,
            wage,
            role,
            uf.has_consent,
            status,
            uf.consent_version,
            uf.wage
          FROM "userFarm" uf, "role" r, "users" u
          WHERE uf.farm_id='${farm_id}'
            AND uf.status='Active'
            AND uf.user_id=u.user_id
            AND uf.role_id=r.role_id
        `);
        const { rows } = userFarm;
        if (!rows || rows.length === 0) {
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

  static delUser() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await baseController.delete(userModel, req.params.id, trx);
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

  static async getAuth0Token() {
    try {
      const res = await axios({
        url: auth0Config.token_url,
        method: 'post',
        headers: auth0Config.token_headers,
        data: auth0Config.token_body,
      });
      if (res.status === 200) {
        if (res.data && res.data.access_token) {
          return res.data.access_token;
        }
      }
    } catch (err) {
      throw 'failed to get auth0 token';
    }
  }

  static async deleteAuth0User(user_id){
    try{
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
      // eslint-disable-next-line
      let result = await axios({
        url: auth0Config.user_url + '/auth0|' + user_id,
        method: 'delete',
        headers,
      });
      return result.status === 204;
    }
    catch(err){
      // eslint-disable-next-line
      console.log(err);
      return false;
    }
  }

  static deactivateUser() {
    return async (req, res) => {
      const user_id = req.params.id;
      // const user = await baseController.getIndividual(userModel, user_id);
      const template_path = '../templates/revocation_of_access_to_farm_email.html';
      // if(user && user[0] && !user[0].is_pseudo){
      //   const isAuth0Deleted = await this.deleteAuth0User(user_id);
      //   if(!isAuth0Deleted){
      //     res.status(400).json({
      //       error: 'Cannot delete auth0 user',
      //     });
      //     return;
      //   }
      // }
      const trx = await transaction.start(Model.knex());
      try {
        const rows = await userFarmModel.query().select('*').where('userFarm.user_id', user_id)
          .leftJoin('role', 'userFarm.role_id', 'role.role_id')
          .leftJoin('users', 'userFarm.user_id', 'users.user_id')
          .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        const subject = 'You\'ve lost access to ' + rows[0].farm_name + ' on LiteFarm!'
        const replacements = {
          first_name: rows[0].first_name,
          farm: rows[0].farm_name,
        };
        const sender = 'help@litefarm.org';
        const isUserFarmPatched = await userFarmModel.query(trx).where('user_id', user_id)
          .patch({
            status: 'Inactive',
          });
        await trx.commit();
        if (isUserFarmPatched) {
          res.sendStatus(200);
          //send email informing user their access revoked (unless user is no account worker - no email)
          try {
            if (rows[0].email) {
              await emailSender.sendEmail(template_path, subject, replacements, rows[0].email, sender)
            }
          } catch (e) {
            console.log(e)
          }
        } else {
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

  static updateConsent(){
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const user_id = req.params.id;
      try {
        const updated = await userModel.query(trx).where('user_id', user_id)
          .patch({
            has_consent: true,
          });
        await trx.commit();
        if (!updated) {
          res.status(409).send('Update failed');
        }
        else {
          res.sendStatus(200);
        }

      }
      catch (error) {
        await trx.rollback();
        res.status(400).send(error);
      }
    }
  }

  static updateUser() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {

        const updated = await baseController.put(userModel, req.params.id, req.body, trx);
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

  static updateNotificationSetting(){
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await userController.updateSetting(req, trx);
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

  static async updateSetting(req, trx){
    const notificationSettingModel = require('../models/notificationSettingModel');
    return await super.put(notificationSettingModel, req, trx);
  }
}

module.exports = userController;
