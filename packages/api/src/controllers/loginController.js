/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (yieldController.js) is part of LiteFarm.
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
const passwordModel = require('../models/passwordModel');
const userFarmModel = require('../models/userFarmModel');
const showedSpotlightModel = require('../models/showedSpotlightModel');
const bcrypt = require('bcryptjs');
const userController = require('./userController');
const { sendEmailTemplate, emails, sendEmail } = require('../templates/sendEmailTemplate');
const parser = require('ua-parser-js');
const userLogModel = require('../models/userLogModel');

const { createToken } = require('../util/jwt');

const loginController = {
  authenticateUser() {
    return async (req, res) => {
      // uses email to identify which user is attempting to log in, can also use user_id for this
      const { email, password } = req.body.user;
      const { screen_width, screen_height } = req.body.screenSize;
      const ua = parser(req.headers['user-agent']);
      const languages = req.acceptsLanguages();
      let userID;

      let ip = req.headers['x-forwarded-for'];
      if (ip) {
        const list = ip.split(',');
        ip = list[list.length - 1];
      } else {
        ip = req.connection.remoteAddress;
      }

      try {
        const userData = await userModel.query().select('*').where('email', email).first();
        const pwData = await passwordModel.query().select('*').where('user_id', userData.user_id).first();
        const isMatch = await bcrypt.compare(password, pwData.password_hash);
        userID = userData.user_id;
        if (!isMatch) {
          await userLogModel.query().insert({
            user_id: userID,
            ip,
            languages,
            browser: ua.browser.name,
            browser_version: ua.browser.version,
            os: ua.os.name,
            os_version: ua.os.version,
            device_vendor: ua.device.vendor,
            device_model: ua.device.model,
            device_type: ua.device.type,
            screen_width,
            screen_height,
            reason_for_failure: 'password_mismatch',
          });
          return res.sendStatus(401);
        };

        const id_token = await createToken('access', { user_id: userData.user_id });
        return res.status(200).send({
          id_token,
          user: userData,
        });
      } catch (error) {
        await userLogModel.query().insert({
          user_id: userID,
          ip,
          languages,
          browser: ua.browser.name,
          browser_version: ua.browser.version,
          os: ua.os.name,
          os_version: ua.os.version,
          device_vendor: ua.device.vendor,
          device_model: ua.device.model,
          device_type: ua.device.type,
          screen_width,
          screen_height,
          reason_for_failure: 'other',
        });
        return res.status(400).json({
          error,
        });
      }
    };
  },

  loginWithGoogle() {
    return async (req, res) => {
      try {
        const { sub: user_id, email, given_name: first_name, family_name: last_name } = req.user;
        const { language_preference } = req.body;
        // TODO optimize this query
        const ssoUser = await userModel.query().findById(user_id);
        const passwordUser = await userModel.query().where({ email }).first();
        const user = ssoUser || passwordUser;
        const isUserNew = !user;
        if (isUserNew) {
          const newUser = { user_id, email, first_name, last_name, language_preference };
          await userModel.transaction(async trx => {
            await userModel.query(trx).insert(newUser);
            await showedSpotlightModel.query(trx).insert({ user_id });
          });
        }
        const isPasswordNeeded = !ssoUser && passwordUser;
        const id_token = isPasswordNeeded
          ? ''
          : await createToken('access', { user_id });
        return res.status(201).send({
          id_token,
          user: {
            user_id: isPasswordNeeded ? passwordUser.user_id : user_id,
            email,
            first_name: isPasswordNeeded ? passwordUser.first_name : first_name,
            language_preference: ssoUser?.language_preference ?? passwordUser?.language_preference ?? language_preference,
            full_name: isPasswordNeeded ? `${passwordUser.first_name} ${passwordUser.last_name}` : `${first_name} ${last_name}`
          },
          isSignUp: isUserNew,
        });
      } catch (err) {
        return res.status(400).json({
          err,
        });
      }
    };
  },

  getUserNameByUserEmail() {
    return async (req, res) => {
      const { email } = req.params;
      try {
        const data = await userModel.query()
          .select('user_id', 'first_name', 'email', 'language_preference', 'status_id').from('users').where('users.email', email).first();
        if (!data) {
          res.status(200).send({
            first_name: null,
            email: null,
            exists: false,
            sso: false,
            invited: false,
            expired: false,
          });
        } else {
          if (data.status_id === 2) {
            await sendMissingInvitations(data);
            return res.status(200).send({
              first_name: data.first_name,
              email: null,
              exists: false,
              sso: false,
              invited: true,
              expired: false,
            });
          }

          if (data.status_id === 3) {
            await sendPasswordReset(data);
            return res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: false,
              sso: false,
              language: data.language_preference,
              invited: false,
              expired: true,
            });
          }
          // User signed up with Google SSO
          if (/^\d+$/.test(data.user_id)) {
            return res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: true,
              language: data.language_preference,
              invited: false,
              expired: false,
            });
          } else if (/^.*@pseudo\.com$/.test(data.email)) {
            return res.sendStatus(400);
          } else {
            return res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: false,
              language: data.language_preference,
              invited: false,
              expired: false,
            });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  },
};

async function sendMissingInvitations(user) {
  const userFarms = await userFarmModel.query().select('users.*', 'farm.farm_name', 'farm.farm_id')
    .join('farm', 'userFarm.farm_id', 'farm.farm_id')
    .join('users', 'users.user_id', 'userFarm.user_id')
    .where('users.user_id', user.user_id).andWhere('userFarm.status', 'Invited');
  if (userFarms) {
    await Promise.all(userFarms.map((userFarm) => {
      return userController.createTokenSendEmail(user, userFarm, userFarm.farm_name);
    }));
  }
}

async function sendPasswordReset(data) {
  const created_at = new Date();
  const wasEmailSent = await passwordModel.query()
    .select('*').where({ user_id: data.user_id }).first();
  const password = wasEmailSent ? wasEmailSent : await passwordModel.query()
    .insert({
      user_id: data.user_id,
      reset_token_version: 1,
      password_hash: `${Math.random()}`,
      created_at: created_at.toISOString(),
    }).returning('*');
  const tokenPayload = {
    ...data,
    reset_token_version: 0,
    created_at: password.created_at.getTime(),
  };
  const token = await createToken('passwordReset', tokenPayload);
  const template_path = emails.PASSWORD_RESET;
  const replacements = {
    first_name: data.first_name,
    locale: data.language_preference,
  };
  const sender = 'system@litefarm.org';
  sendEmail(template_path, replacements, data.email, {
    sender,
    buttonLink: `/callback/?reset_token=${token}`,
  });
}

module.exports = loginController;
