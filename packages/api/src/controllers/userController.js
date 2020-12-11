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
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../util/jwt');
const emailSender = require('../templates/sendEmailTemplate');

class userController extends baseController {
  static addUser() {
    return async (req, res) => {
      const { email, first_name, last_name, password } = req.body;
      const userData = {
        email,
        first_name,
        last_name,
      };

      // const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
      // if (!validEmailRegex.test(email)) {
      //   userData.email = `${email.substring(0, email.length - 9)}@${email.substring(email.length - 9)}`
      // }

      const trx = await transaction.start(Model.knex());
      try {
        // hash password
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(password, salt);

        // persist user data
        const result = await baseController.post(userModel, userData, trx);
        await trx.commit();

        delete result.password_hash;

        // generate token, set to last a week
        const token = await createAccessToken({ ...result });

        // send welcome email
        try {
          const template_path = '../templates/welcome_email.html';
          const subject = 'Welcome to LiteFarm!';
          const replacements = {
            first_name: result.first_name,
          };
          const sender = 'system@litefarm.org';
          console.log('template_path:', template_path);
          if (result.email && template_path) {
            await emailSender.sendEmail(template_path, subject, replacements, result.email, sender);
          }
        } catch (e) {
          console.log('Failed to send email: ', e);
        }

        // send token and user data (sans password hash)
        delete result.password_hash;
        res.status(201).send({
          token,
          user: result,
        });
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
        const { user_id, farm_id, first_name, last_name, wage, email } = req.body;
        const { type: wageType, amount: wageAmount } = wage || {};

        /* Start of input validation */
        const requiredProps = {
          user_id,
          farm_id,
          first_name,
          last_name,
          email,
        };

        if (Object.keys(requiredProps).some((key) => !requiredProps[key])) {
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
          await trx.rollback();
          return res.status(400).send(errorMessage);
        }

        if (email !== `${user_id}@pseudo.com`) {
          await trx.rollback();
          return res.status(400).send('Invalid pseudo user email');
        }

        const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);
        if (wage && wageAmount && !validWageRegex.test(wageAmount)) {
          await trx.rollback();
          return res.status(400).send('Invalid wage amount');
        }

        if (wage && wageType && wageType.toLowerCase() !== 'hourly') {
          await trx.rollback();
          return res.status(400).send('Current app version only allows hourly wage');
        }
        /* End of input validation */

        const user = await baseController.post(userModel, req.body, trx);
        const userFarm = await userFarmModel.query(trx).insert({
          user_id,
          farm_id,
          status: 'Active',
          consent_version: '1.0',
          role_id: 4,
          wage,
          step_one: true,
          step_two: true,
          step_three: true,
          step_four: true,
          step_five: true,
        });
        await trx.commit();
        res.status(201).send({ ...user, ...userFarm });
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
        const id = req.params.user_id;

        const data = await userModel.query().findById(id)
          .select('first_name', 'last_name', 'profile_picture', 'email', 'phone_number', 'user_id');

        if (!data) {
          res.sendStatus(404);
        } else {
          res.status(200).send(data);
        }
      } catch (error) {
        //handle more exceptions
        console.log(error);
        res.status(400).send(error);
      }
    };
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

  static async deleteAuth0User(user_id) {
    try {
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + token,
      };
      // eslint-disable-next-line
      let result = await axios({
        url: auth0Config.user_url + '/auth0|' + user_id,
        method: 'delete',
        headers,
      });
      return result.status === 204;
    } catch (err) {
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
        const rows = await userFarmModel
          .query()
          .select('*')
          .where('userFarm.user_id', user_id)
          .leftJoin('role', 'userFarm.role_id', 'role.role_id')
          .leftJoin('users', 'userFarm.user_id', 'users.user_id')
          .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        const subject = "You've lost access to " + rows[0].farm_name + ' on LiteFarm!';
        const replacements = {
          first_name: rows[0].first_name,
          farm: rows[0].farm_name,
        };
        const sender = 'help@litefarm.org';
        const isUserFarmPatched = await userFarmModel.query(trx).where('user_id', user_id).patch({
          status: 'Inactive',
        });
        await trx.commit();
        if (isUserFarmPatched) {
          res.sendStatus(200);
          //send email informing user their access revoked (unless user is no account worker - no email)
          try {
            if (rows[0].email) {
              await emailSender.sendEmail(
                template_path,
                subject,
                replacements,
                rows[0].email,
                sender,
              );
            }
          } catch (e) {
            console.log(e);
          }
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
  }

  static updateConsent() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const user_id = req.params.id;
      try {
        const updated = await userModel.query(trx).where('user_id', user_id).patch({
          has_consent: true,
        });
        await trx.commit();
        if (!updated) {
          res.status(409).send('Update failed');
        } else {
          res.sendStatus(200);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  }

  static updateUser() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(userModel, req.params.user_id, req.body, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static updateNotificationSetting() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await userController.updateSetting(req, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(updated);
        }
      } catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static async updateSetting(req, trx) {
    const notificationSettingModel = require('../models/notificationSettingModel');
    return await super.put(notificationSettingModel, req, trx);
  }
}

module.exports = userController;
