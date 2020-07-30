/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (createUserController.js) is part of LiteFarm.
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

const findAuth0Uri = require('../util');
const auth0Config = require('../auth0Config');
const baseController = require('../controllers/baseController');
const userModel = require('../models/userModel');
const userFarmModel = require('../models/userFarmModel');
const emailTokenModel = require('../models/emailTokenModel');
const roleModel = require('../models/roleModel');
const { transaction, Model } = require('objection');
const axios = require('axios');
const url  = require('url');
const emailSender = require('../templates/sendEmailTemplate');
const farmModel = require('../models/farmModel');
const uuidv4 = require('uuid/v4');

const auth0Uri = findAuth0Uri();

class createUserController extends baseController {
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
      throw 'err: failed to get auth0 token';
    }
  }

  static async getAuth0UserByEmail(email) {
    try {
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
      const parsedEmail = email.replace('@', '%40');
      const result = await axios({
        url: auth0Config.token_body.audience + 'users-by-email?email=' + parsedEmail,
        method: 'get',
        headers,
      });
      if (result.status === 200) {
        return result;
      }
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async postToAuth0(user) {
    try {
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
      const result = await axios({
        url: auth0Config.user_url,
        method: 'post',
        headers,
        data: user,
      });
      if (result.status === 201) {
        return result;
      }
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async sendResetPassword(email) {
    try {
      const result = await axios({
        url: `${auth0Uri}/dbconnections/change_password`,
        method: 'post',
        headers: auth0Config.token_headers,
        data: {
          client_id: auth0Config.token_body.client_id,
          email,
          connection: 'Username-Password-Authentication',
        },
        json: true,
      });
      if (result.status === 201) {
        return result;
      }
    }
    catch (err) {
      throw new Error(err);
    }
  }

  static async deleteAuth0User(user_id){
    try{
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
      const result = await axios({
        url: auth0Config.user_url + '/' + user_id,
        method: 'delete',
        headers,
      });
      return result.status === 204;
    }
    catch(err){
      return false;
    }
  }

  static createAuth0User() {
    return async (req, res) => {
      let user_id;
      const template_path = '../templates/invitation_to_farm_email.html';
      const sender = 'help@litefarm.org';

      const { email, password, user_metadata, farm_id, role_id, wage } = req.body;
      const { first_name, last_name } = user_metadata || {};
      const { type: wageType, amount: wageAmount } = wage || {};

      /* Start of input validation */
      const requiredProps = {
        email,
        password,
        user_metadata,
        first_name,
        last_name,
        farm_id,
        role_id,
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

      const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
      if (!validEmailRegex.test(email)) {
        return res.status(400).send('Invalid email');
      }

      const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);
      if (wage && wageAmount && !validWageRegex.test(wageAmount)) {
        return res.status(400).send('Invalid wage amount');
      }

      if (wage && wageType && wageType.toLowerCase() !== 'hourly') {
        return res.status(400).send('Current app version only allows hourly wage');
      }

      try {
        const rows = await roleModel.query().select('*').where('role_id', role_id);
        if (!rows || !rows.length) {
          return res.status(400).send('Invalid role');
        }
      } catch (error) {
        console.log(error);
      }
      /* End of input validation */

      const user = {
        email,
        password,
        user_metadata,
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
      };

      await this.postToAuth0(user).then(async (authResponse) => {
        user_id = authResponse.user_id;
        const url_parts = url.parse(authResponse.data.picture, true);
        const query = url_parts.query;
        const lite_farm_user = {
          user_id: authResponse.data.user_id.split('|')[1],
          first_name: authResponse.data.user_metadata.first_name,
          last_name: authResponse.data.user_metadata.last_name,
          email: authResponse.data.email,
          profile_picture: query.d || '',
          farm_id: req.body.farm_id,
          role_id: req.body.role_id,
          wage: req.body.wage,
        };
        const rows = await farmModel.query().select('*').where('farm.farm_id', lite_farm_user.farm_id);
        const replacements = {
          first_name: lite_farm_user.first_name,
          farm: rows[0].farm_name,
        };
        const subject = `You’ve been invited to join ${rows[0].farm_name} on LiteFarm!`;
        const trx = await transaction.start(Model.knex());
        baseController.post(userModel, lite_farm_user, trx).then(async () => {
          await userFarmModel.query(trx).insert({
            user_id: lite_farm_user.user_id,
            farm_id: lite_farm_user.farm_id,
            status: 'Invited',
            consent_version: '1.0',
            role_id: lite_farm_user.role_id,
            wage: lite_farm_user.wage,
          });

          // create invite token
          let token = uuidv4();
          // gets rid of the dashes
          token = token.replace(/[-]/g, "");
          // add a row in emailToken table
          await emailTokenModel.query(trx).insert({
            user_id: lite_farm_user.user_id,
            farm_id: lite_farm_user.farm_id,
            token,
            is_used: false,
          });

          trx.commit();
          res.sendStatus(201);

          // the following is to determine the url
          const environment = process.env.NODE_ENV || 'development';
          let joinUrl;
          // preferably with a switch case
          if(environment === 'integration'){
            joinUrl = `https://beta.litefarm.org/sign_up/${token}/${lite_farm_user.user_id}/${lite_farm_user.farm_id}/${lite_farm_user.email}/${lite_farm_user.first_name}/${lite_farm_user.last_name}`;
          }else if(environment === 'production'){
            joinUrl = `https://www.litefarm.org/sign_up/${token}/${lite_farm_user.user_id}/${lite_farm_user.farm_id}/${lite_farm_user.email}/${lite_farm_user.first_name}/${lite_farm_user.last_name}`;
          }else{
            joinUrl = `localhost:3000/sign_up/${token}/${lite_farm_user.user_id}/${lite_farm_user.farm_id}/${lite_farm_user.email}/${lite_farm_user.first_name}/${lite_farm_user.last_name}`
          }
          await emailSender.sendEmail(template_path, subject, replacements, lite_farm_user.email, sender, true, joinUrl);
        }).catch(async (err) => {
          console.log(err);
          if(await this.deleteAuth0User(user_id)){
            await trx.rollback();
            res.status(500).send(err);
          }
          else{
            res.status(500).send(err);
          }
        });
      }).catch(async (addNewUserError) => {
        console.log(addNewUserError.message);
        if (addNewUserError.response.status === 409) {
          // at this point the user exists on Auth0
          try {
            const trx = await transaction.start(Model.knex());
            const authResponse = await this.getAuth0UserByEmail(req.body.email);
            const user_id = authResponse.data[0].user_id.split('|')[1];
            // check if user exists in users table
            const rows = await userModel.query().select('*').where('user_id', user_id);
            if (rows && rows.length === 0) {
              res.status(404).send('User already exists but not found in database');
            } else {
              // at this point user exists on Auth0 AND in users table, so just
              // add userFarm association to add the user to current farm, status
              // is Active by default because no sign up is required
              await userFarmModel.query(trx).insert({
                user_id,
                farm_id: req.body.farm_id,
                status: 'Active',
                consent_version: '1.0',
                role_id: req.body.role_id,
                wage: req.body.wage,
              });
              trx.commit();
              res.sendStatus(201);
              const rows = await farmModel.query().select('*').where('farm.farm_id', req.body.farm_id);
              const replacements = {
                first_name: authResponse.data[0].user_metadata.first_name,
                farm: rows[0].farm_name,
              };
              const subject = `You’ve been invited to join ${rows[0].farm_name} on LiteFarm!`;
              await emailSender.sendEmail(template_path, subject, replacements, authResponse.data[0].email, sender);
            }
          } catch (addExistingUserError) {
            console.log(addExistingUserError);
            res.status(500).send(addExistingUserError.message);
          }
        } else {
          res.status(500).send(addNewUserError.message);
        }
      })
      //   .then(async () => {
      //   return await this.sendResetPassword(req.body.email);
      // }).catch((response) => {
      //   console.log(response.message);
      //   res.status(500).send(response.message);
      // });
    };
  }
}

module.exports = createUserController;
